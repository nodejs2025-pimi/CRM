import { Component, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Title } from "@shared/components/title/title";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { OrderItemType, OrderType } from "@shared/types/OrderType";
import { OrderStatusEnum } from "@shared/types/OrderType";
import { ShopTypeEnum } from "@shared/types/ShopType";
import { Popup } from "@shared/components/popup/popup";
import { OrdersService } from "@shared/services/orders.service";
import { Input } from "@shared/components/input/input";

@Component({
    selector: "app-orders",
    imports: [Title, Button, DatePipe, CurrencyPipe, Popup, Input],
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

    protected orderEstablishmentId: WritableSignal<number> = signal(0);
    protected orderStatus: WritableSignal<OrderStatusEnum> = signal(OrderStatusEnum.NEW);


    protected isOrderItemCreationPopupOpen: WritableSignal<boolean> = signal(false);
    protected isOrderItemEditingPopupOpen: WritableSignal<boolean> = signal(false);

    protected orderItemPopupTitle: WritableSignal<string> = signal("");

    protected editingOrderItemId: WritableSignal<number | null> = signal(null);

    protected orderItemProductId: WritableSignal<number> = signal(0);
    protected orderItemQuantity: WritableSignal<number> = signal(1);


    protected OrderStatusEnum = OrderStatusEnum;
    protected ShopTypeEnum = ShopTypeEnum;

    private ordersService: OrdersService = inject(OrdersService);

    ngOnInit(): void {
        this.loadOrders();
    }

    private loadOrders(): void {
        // const sampleOrders: OrderType[] = [
        //     {
        //         order_id: 2,
        //         establishment: {
        //             establishment_id: 102,
        //             name: "Restaurant Example",
        //             phone: "987-654-3210",
        //             email: "another@example.com",
        //             type: ShopTypeEnum.RESTAURANT,
        //             address: "456 Another Ave",
        //         },
        //         date: "2024-02-15T18:30:00Z",
        //         status: OrderStatusEnum.CONFIRMED,
        //         orderProducts: [
        //             {
        //                 order_id: 2,
        //                 product: {
        //                     product_id: 203,
        //                     name: "Food Item",
        //                     price: 14.99,
        //                     available_quantity: 200,
        //                     wholesale_price: 12.99,
        //                     wholesale_minimum_quantity: 20,
        //                     is_active: true,
        //                 },
        //                 quantity: 3,
        //                 price: 44.97,
        //             },
        //         ],
        //     },
        //     {
        //         order_id: 1,
        //         establishment: {
        //             establishment_id: 101,
        //             name: "Sample Shop",
        //             phone: "123-456-7890",
        //             email: "sample@example.com",
        //             type: ShopTypeEnum.SHOP,
        //             address: "123 Sample St",
        //         },
        //         date: "2024-01-01T12:00:00Z",
        //         status: OrderStatusEnum.DELIVERED,
        //         orderProducts: [
        //             {
        //                 order_id: 1,
        //                 product: {
        //                     product_id: 201,
        //                     name: "Sample Product",
        //                     price: 19.99,
        //                     available_quantity: 100,
        //                     wholesale_price: 15.99,
        //                     wholesale_minimum_quantity: 10,
        //                     is_active: true,
        //                 },
        //                 quantity: 2,
        //                 price: 39.98,
        //             },
        //             {
        //                 order_id: 1,
        //                 product: {
        //                     product_id: 202,
        //                     name: "Another Product",
        //                     price: 9.99,
        //                     available_quantity: 50,
        //                     wholesale_price: 7.99,
        //                     wholesale_minimum_quantity: 5,
        //                     is_active: true,
        //                 },
        //                 quantity: 1,
        //                 price: 9.99,
        //             },
        //             {
        //                 order_id: 1,
        //                 product: {
        //                     product_id: 204,
        //                     name: "Extra Product",
        //                     price: 4.99,
        //                     available_quantity: 75,
        //                     wholesale_price: 3.99,
        //                     wholesale_minimum_quantity: 8,
        //                     is_active: true,
        //                 },
        //                 quantity: 5,
        //                 price: 24.95,
        //             }
        //         ],
        //     },
        // ];

        // this.orders.set(sampleOrders);

        this.ordersService.getOrders()
            .then((orders: OrderType[]) => {
                this.orders.set(orders);
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
        this.orderEstablishmentId.set(0);
        this.orderStatus.set(OrderStatusEnum.NEW);

        this.orderPopupTitle.set("Create New Order");
        this.isOrderCreationPopupOpen.set(true);
    }

    protected createOrder(event: Event): void {
        event.preventDefault();

        const newOrder: Pick<OrderType, "status" | "date"> & { establishment_id: number } = {
            establishment_id: this.orderEstablishmentId(),
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

        this.orderEstablishmentId.set(orderToEdit.establishment.establishment_id);
        this.orderStatus.set(orderToEdit.status);

        this.orderPopupTitle.set("Edit Order");
        this.isOrderEditingPopupOpen.set(true);
    }

    protected updateOrder(event: Event): void {
        event.preventDefault();

        const updatedOrderData: Pick<OrderType, "status"> & { establishment_id: number } = {
            establishment_id: this.orderEstablishmentId(),
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

        this.orderItemProductId.set(0);
        this.orderItemQuantity.set(1);

        this.orderItemPopupTitle.set("Add Order Item");
        this.isOrderItemCreationPopupOpen.set(true);
    }

    protected addOrderItem(event: Event): void {
        event.preventDefault();

        const newOrderItem: Pick<OrderItemType, "quantity"> & { product_id: number } = {
            product_id: this.orderItemProductId(),
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

        this.orderItemProductId.set(orderItemId);
        this.orderItemQuantity.set(orderItemToEdit.quantity);

        this.orderItemPopupTitle.set("Edit Order Item");
        this.isOrderItemEditingPopupOpen.set(true);
    }

    protected updateOrderItem(event: Event): void {
        event.preventDefault();

        const updatedOrderData: Pick<OrderItemType, "quantity"> = {
            quantity: this.orderItemQuantity(),
        };

        this.ordersService.updateOrderItem(this.editingOrderId()!, this.orderItemProductId()!, updatedOrderData)
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
