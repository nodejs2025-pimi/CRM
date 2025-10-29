import {
    Component,
    computed,
    ElementRef,
    inject,
    OnInit,
    Signal,
    signal,
    ViewChild,
    WritableSignal,
} from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Title } from "@shared/components/title/title";
import { OrdersService } from "@shared/services/orders.service";
import { ProductsService } from "@shared/services/products.service";
import { ShopsService } from "@shared/services/shops.service";
import { OrderItemType, OrderStatusEnum, OrderType } from "@shared/types/OrderType";
import { ProductType } from "@shared/types/ProductType";
import { ShopType, ShopTypeEnum } from "@shared/types/ShopType";
import { Chart, registerables } from "chart.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

Chart.register(...registerables);

@Component({
    selector: "app-analytics",
    imports: [Title, Button],
    templateUrl: "./analytics.html",
    styleUrl: "./analytics.css",
})
export class Analytics implements OnInit {
    protected readonly orders: WritableSignal<OrderType[]> = signal<OrderType[]>([]);
    protected readonly products: WritableSignal<ProductType[]> = signal<ProductType[]>([]);
    protected readonly shops: WritableSignal<ShopType[]> = signal<ShopType[]>([]);

    protected readonly totalRevenue: Signal<number> = computed<number>(() => {
        return this.orders().reduce((sum: number, order: OrderType) => {
            const orderTotal = order.orderProducts.reduce(
                (acc: number, item: OrderItemType) => acc + item.price * item.quantity,
                0,
            );

            return sum + orderTotal;
        }, 0);
    });

    protected readonly averageOrderPrice: Signal<number> = computed<number>(() => {
        if (!this.orders().length) {
            return 0;
        }

        const totalOrderCount = this.orders().reduce((sum: number) => sum + 1, 0);

        return this.totalRevenue() / totalOrderCount;
    });

    protected readonly monthRevenue: Signal<number> = computed<number>(() => {
        return this.orders().reduce((sum: number, order: OrderType) => {
            if (
                order.date &&
                new Date(order.date).getMonth() == new Date().getMonth() &&
                new Date(order.date).getFullYear() == new Date().getFullYear()
            ) {
                const orderTotal = order.orderProducts.reduce(
                    (acc: number, item: OrderItemType) => acc + item.price * item.quantity,
                    0,
                );

                return sum + orderTotal;
            }

            return sum;
        }, 0);
    });

    protected readonly prevMonthRevenue: Signal<number> = computed<number>(() => {
        const prev = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
        const prevMonth = prev.getMonth();
        const prevYear = prev.getFullYear();

        return this.orders().reduce((sum: number, order: OrderType) => {
            if (
                order.date &&
                new Date(order.date).getMonth() == prevMonth &&
                new Date(order.date).getFullYear() == prevYear
            ) {
                const orderTotal = order.orderProducts.reduce(
                    (acc: number, item: OrderItemType) => acc + item.price * item.quantity,
                    0,
                );

                return sum + orderTotal;
            }

            return sum;
        }, 0);
    });

    protected readonly topProduct: Signal<{ product: ProductType; sold: number } | null> = computed<{
        product: ProductType;
        sold: number;
    } | null>(() => {
        const orders = this.orders().filter((order: OrderType) => {
            const dateTime = new Date().getTime() - 1000 * 60 * 60 * 24 * 7;

            if (order.date) {
                return dateTime < new Date(order.date).getTime();
            }
            return false;
        });

        if (!orders.length) {
            return null;
        }

        const counter = new Map<number, { product: ProductType; sold: number }>();

        for (const order of orders) {
            for (const item of order.orderProducts) {
                const existing = counter.get(item.product.product_id);
                if (existing) {
                    existing.sold += item.quantity;
                } else {
                    counter.set(item.product.product_id, {
                        product: item.product,
                        sold: item.quantity,
                    });
                }
            }
        }

        return Array.from(counter.values()).sort((a, b) => b.sold - a.sold)[0] ?? null;
    });

    protected readonly topBuyer: Signal<{ shop: ShopType; total: number } | null> = computed<{
        shop: ShopType;
        total: number;
    } | null>(() => {
        const orders = this.orders().filter((order: OrderType) => {
            const dateTime = new Date().getTime() - 1000 * 60 * 60 * 24 * 7;

            if (order.date) {
                return dateTime < new Date(order.date).getTime();
            }
            return false;
        });

        if (!orders.length) {
            return null;
        }

        const totals = new Map<number, { shop: ShopType; total: number }>();

        for (const order of orders) {
            const shop = order.establishment;
            const shopId = shop.establishment_id;

            const orderTotal = order.orderProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);

            const current = totals.get(shopId);
            if (current) {
                current.total += orderTotal;
            } else {
                totals.set(shopId, { shop, total: orderTotal });
            }
        }

        return Array.from(totals.values()).sort((a, b) => b.total - a.total)[0] ?? null;
    });

    protected readonly productsAvailibility: Signal<number> = computed<number>(() => {
        if (!this.products().length) {
            return 0;
        }

        let totalProductCount = 0;
        let activeProductCount = 0;

        this.products().forEach((product: ProductType) => {
            totalProductCount++;
            if (product.is_active && product.available_quantity) {
                activeProductCount++;
            }
        });

        return activeProductCount / totalProductCount;
    });

    @ViewChild("revenueByMonth") revenueByMonthRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild("establishmentCount") establishmentCountRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild("analytics") analytics!: ElementRef<HTMLElement>;

    private readonly ordersService: OrdersService = inject(OrdersService);
    private readonly productsService: ProductsService = inject(ProductsService);
    private readonly shopsService: ShopsService = inject(ShopsService);

    ngOnInit(): void {
        this.loadOrders();
        this.loadProducts();
        this.loadShops();
    }

    private loadOrders(): void {
        this.ordersService.getOrders().then((orders: OrderType[]) => {
            this.orders.set(orders);
        });
        setTimeout(() => {
            this.initOrdersChart();
            this.initShopsChart();
        }, 2000);
    }

    private loadProducts(): void {
        this.productsService.getProducts("name", "asc", "").then((products: ProductType[]) => {
            this.products.set(products);
        });
    }

    private loadShops(): void {
        this.shopsService.getShops().then((shops: ShopType[]) => {
            this.shops.set(shops);
        });
    }

    private initOrdersChart(): void {
        const ctx: HTMLCanvasElement = this.revenueByMonthRef.nativeElement;

        const monthlyRevenue = new Array(12).fill(0);

        this.orders.set([
            {
                date: "11/03/2025",
                order_id: 1,
                establishment: {
                    address: "Sgsg",
                    email: "asgasg",
                    establishment_id: 1,
                    name: "shop",
                    phone: "09136216126",
                    type: ShopTypeEnum.SHOP,
                },
                status: OrderStatusEnum.CONFIRMED,
                orderProducts: [
                    {
                        price: 1000,
                        quantity: 2,
                        order_id: 1,
                        product: {
                            available_quantity: 4,
                            is_active: true,
                            name: "name",
                            price: 12,
                            product_id: 1,
                            wholesale_minimum_quantity: 10,
                            wholesale_price: 10,
                        },
                    },
                ],
            },
            {
                date: "10/13/2025",
                order_id: 1,
                establishment: {
                    address: "Sgsg",
                    email: "asgasg",
                    establishment_id: 1,
                    name: "shop",
                    phone: "09136216126",
                    type: ShopTypeEnum.SHOP,
                },
                status: OrderStatusEnum.CONFIRMED,
                orderProducts: [
                    {
                        price: 800,
                        quantity: 5,
                        order_id: 1,
                        product: {
                            available_quantity: 4,
                            is_active: true,
                            name: "name3",
                            price: 12,
                            product_id: 1,
                            wholesale_minimum_quantity: 10,
                            wholesale_price: 10,
                        },
                    },
                ],
            },
        ]);

        this.orders().forEach((order: OrderType) => {
            if (!order.date) {
                return;
            }
            const month = new Date(order.date).getMonth();

            const total = order.orderProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
            monthlyRevenue[month] += total;
        });

        console.log(monthlyRevenue);

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
                datasets: [
                    {
                        label: "",
                        data: monthlyRevenue,
                        backgroundColor: "#9b5de5",
                        borderRadius: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => `$ ${context.parsed.y!.toLocaleString()}`,
                        },
                    },
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Revenue ($)",
                            color: "#a1a1a1",
                        },
                        grid: {
                            color: "#a1a1a1",
                        },
                        ticks: {
                            color: "#a1a1a1",
                            font: { size: 14 },
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Month",
                            color: "#a1a1a1",
                        },
                        grid: {
                            color: "#a1a1a1",
                        },
                        ticks: {
                            color: "#a1a1a1",
                            font: { size: 14 },
                        },
                    },
                },
            },
        });
    }

    private initShopsChart(): void {
        const ctx: HTMLCanvasElement = this.establishmentCountRef.nativeElement;

        const establishmentByType = {
            [ShopTypeEnum.CAFE]: 0,
            [ShopTypeEnum.RESTAURANT]: 0,
            [ShopTypeEnum.SHOP]: 0,
        };

        this.shops.set([
            {
                address: "asgsag",
                email: "asg",
                establishment_id: 1,
                name: "ShopName",
                phone: "09215215215",
                type: ShopTypeEnum.CAFE,
            },
            {
                address: "asgsag",
                email: "asg",
                establishment_id: 2,
                name: "ShopName2",
                phone: "09219199015",
                type: ShopTypeEnum.CAFE,
            },
            {
                address: "asgsag",
                email: "asg",
                establishment_id: 3,
                name: "ShopName3",
                phone: "09215988015",
                type: ShopTypeEnum.SHOP,
            },
        ]);

        this.shops().forEach((establishment: ShopType) => {
            establishmentByType[establishment.type]++;
        });

        console.log(establishmentByType);

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: [ShopTypeEnum.CAFE, ShopTypeEnum.RESTAURANT, ShopTypeEnum.SHOP],
                datasets: [
                    {
                        label: "",
                        data: establishmentByType,
                        backgroundColor: "#9b5de5",
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => `$ ${context.parsed.y!.toLocaleString()}`,
                        },
                    },
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Amount",
                            color: "#a1a1a1",
                        },
                        grid: {
                            color: "#a1a1a1",
                        },
                        ticks: {
                            color: "#a1a1a1",
                            font: { size: 14 },
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Type",
                            color: "#a1a1a1",
                        },
                        grid: {
                            color: "#a1a1a1",
                        },
                        ticks: {
                            color: "#a1a1a1",
                            font: { size: 14 },
                        },
                    },
                },
            },
        });
    }

    protected downloadPDF(): void {
        html2canvas(this.analytics.nativeElement, { scale: 2, backgroundColor: "#ffffff" }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");

            const pageWidth = pdf.internal.pageSize.getWidth();
            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
            pdf.save(`analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`);
        });
    }
}
