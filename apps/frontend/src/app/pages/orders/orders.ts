import { Component, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Title } from "@shared/components/title/title";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { OrderItemType, OrderType } from "@shared/types/OrderType";
import { OrderStatusEnum } from "@shared/types/OrderType";
import { ShopType, ShopTypeEnum } from "@shared/types/ShopType";
import { Popup } from "@shared/components/popup/popup";
import { OrdersService } from "@shared/services/orders.service";
import { Input } from "@shared/components/input/input";
import { Select } from "@shared/components/select/select";
import { ProductsService } from "@shared/services/products.service";
import { ShopsService } from "@shared/services/shops.service";
import { ProductType } from "@shared/types/ProductType";

@Component({
    selector: "app-orders",
    imports: [Title, Button, DatePipe, CurrencyPipe, Popup, Input, Select],
    templateUrl: "./orders.html",
    styleUrl: "./orders.css",
})
export class Orders implements OnInit {
    protected orders: WritableSignal<OrderType[]> = signal([]);

    protected openedOrders: WritableSignal<Set<number>> = signal(new Set<number>());

    protected isOrderCreationPopupOpen: WritableSignal<boolean> = signal(false);
    protected isOrderEditingPopupOpen: WritableSignal<boolean> = signal(false);

    protected orderPopupTitle: WritableSignal<string> = signal("");

    protected editingOrderId: WritableSignal<number | null> = signal(null);

    protected orderEstablishmentId: WritableSignal<string> = signal("");
    protected orderStatus: WritableSignal<OrderStatusEnum> = signal(OrderStatusEnum.NEW);


    protected isOrderItemCreationPopupOpen: WritableSignal<boolean> = signal(false);
    protected isOrderItemEditingPopupOpen: WritableSignal<boolean> = signal(false);

    protected orderItemPopupTitle: WritableSignal<string> = signal("");

    protected editingOrderItemId: WritableSignal<number | null> = signal(null);

    protected orderItemProductId: WritableSignal<string> = signal("");
    protected orderItemQuantity: WritableSignal<number> = signal(1);


    protected OrderStatusEnum = OrderStatusEnum;
    protected ShopTypeEnum = ShopTypeEnum;

    protected products: WritableSignal<ProductType[]> = signal([]);
    protected shops: WritableSignal<ShopType[]> = signal([]);

    private ordersService: OrdersService = inject(OrdersService);
    private productsService: ProductsService = inject(ProductsService);
    private shopsService: ShopsService = inject(ShopsService);

    ngOnInit(): void {
        this.loadOrders();

        this.loadProducts();
        this.loadShops();
    }

    private loadOrders(): void {
        this.ordersService.getOrders()
            .then((orders: OrderType[]) => {
                this.orders.set(orders);
            });
    }

    private loadProducts(): void {
        this.productsService.getProducts("name", "asc", "")
            .then((products: ProductType[]) => {
                this.products.set(products);
            });
    }

    private loadShops(): void {
        this.shopsService.getShops()
            .then((shops: ShopType[]) => {
                this.shops.set(shops);
            });
    }

    protected getTotalOrderPrice(order: OrderType): number {
        return order.orderProducts.reduce((total: number, item: OrderItemType) => total + item.price, 0);
    }

    protected toggleOrderDetails(orderId: number): void {
        const openedOrdersSet = new Set(this.openedOrders());

        if (openedOrdersSet.has(orderId)) {
            openedOrdersSet.delete(orderId);
        }
        else {
            openedOrdersSet.add(orderId);
        }

        this.openedOrders.set(openedOrdersSet);
    }

    protected isOrderOpened(orderId: number): boolean {
        return this.openedOrders().has(orderId);
    }

    protected openOrderCreationPopup(): void {
        this.orderEstablishmentId.set(this.shops()[0].establishment_id.toString());
        this.orderStatus.set(OrderStatusEnum.NEW);

        this.orderPopupTitle.set("Create New Order");
        this.isOrderCreationPopupOpen.set(true);
    }

    protected createOrder(event: Event): void {
        event.preventDefault();

        const newOrder: Pick<OrderType, "status" | "date"> & { establishment_id: number } = {
            establishment_id: +this.orderEstablishmentId(),
            status: this.orderStatus(),
        };

        this.ordersService.createOrder(newOrder)
            .then(() => {
                this.loadOrders();
                this.isOrderCreationPopupOpen.set(false);
            });
    }

    protected editOrder(id: number): void {
        const orderToEdit: OrderType | undefined = this.orders().find((order: OrderType) => order.order_id === id);

        if (!orderToEdit) {
            return;
        }

        this.editingOrderId.set(id);

        this.orderEstablishmentId.set(orderToEdit.establishment.establishment_id.toString());
        this.orderStatus.set(orderToEdit.status);

        this.orderPopupTitle.set("Edit Order");
        this.isOrderEditingPopupOpen.set(true);
    }

    protected updateOrder(event: Event): void {
        event.preventDefault();

        const updatedOrderData: Pick<OrderType, "status"> & { establishment_id: number } = {
            establishment_id: +this.orderEstablishmentId(),
            status: this.orderStatus(),
        };

        this.ordersService.updateOrder(this.editingOrderId()!, updatedOrderData)
            .then(() => {
                this.loadOrders();
                this.isOrderEditingPopupOpen.set(false);
            });
    }

    protected onOrderPopupClose(): void {
        this.isOrderCreationPopupOpen.set(false);
        this.isOrderEditingPopupOpen.set(false);
    }

    protected deleteOrder(orderId: number): void {
        this.ordersService.deleteOrder(orderId)
            .then(() => {
                this.loadOrders();

                this.openedOrders.update((openedOrdersSet: Set<number>) => {
                    openedOrdersSet.delete(orderId);
                    return openedOrdersSet;
                });
            });
    }

    protected openOrderItemCreationPopup(orderId: number): void {
        this.editingOrderId.set(orderId);

        this.orderItemProductId.set(this.products()[0].product_id.toString());
        this.orderItemQuantity.set(1);

        this.orderItemPopupTitle.set("Add Order Item");
        this.isOrderItemCreationPopupOpen.set(true);
    }

    protected addOrderItem(event: Event): void {
        event.preventDefault();

        const newOrderItem: Pick<OrderItemType, "quantity"> & { product_id: number } = {
            product_id: +this.orderItemProductId(),
            quantity: this.orderItemQuantity(),
        };

        this.ordersService.addOrderItem(this.editingOrderId()!, newOrderItem)
            .then(() => {
                this.loadOrders();
                this.isOrderItemCreationPopupOpen.set(false);
            });
    }

    protected editOrderItem(orderId: number, orderItemId: number): void {
        const orderItemToEdit: OrderItemType | undefined = this.orders()
            .find((order: OrderType) => order.order_id === orderId)!
            .orderProducts.find((item: OrderItemType) => item.product.product_id === orderItemId);

        if (!orderItemToEdit) {
            return;
        }

        this.editingOrderId.set(orderId);

        this.orderItemProductId.set(orderItemId.toString());
        this.orderItemQuantity.set(orderItemToEdit.quantity);

        this.orderItemPopupTitle.set("Edit Order Item");
        this.isOrderItemEditingPopupOpen.set(true);
    }

    protected updateOrderItem(event: Event): void {
        event.preventDefault();

        const updatedOrderData: Pick<OrderItemType, "quantity"> = {
            quantity: this.orderItemQuantity(),
        };

        this.ordersService.updateOrderItem(this.editingOrderId()!, +this.orderItemProductId()!, updatedOrderData)
            .then(() => {
                this.loadOrders();
                this.isOrderItemEditingPopupOpen.set(false);
            });
    }

    protected onOrderItemPopupClose(): void {
        this.isOrderItemCreationPopupOpen.set(false);
        this.isOrderItemEditingPopupOpen.set(false);
    }

    protected deleteOrderItem(orderId: number, productId: number): void {
        this.ordersService.removeOrderItem(orderId, productId)
            .then(() => {
                this.loadOrders();
            });
    }
}
