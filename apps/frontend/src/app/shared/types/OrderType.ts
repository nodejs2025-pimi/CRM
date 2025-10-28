import { ProductType } from "./ProductType";
import { ShopType } from "./ShopType";

export interface OrderItemType {
    order_id: number;
    product: ProductType;
    quantity: number;
    price: number;
}

export enum OrderStatusEnum {
    NEW = "new",
    CONFIRMED = "confirmed",
    DELIVERED = "delivered",
}

export interface OrderType {
    order_id: number;
    establishment: ShopType;
    date?: string;
    status: OrderStatusEnum;
    orderProducts: OrderItemType[];
}