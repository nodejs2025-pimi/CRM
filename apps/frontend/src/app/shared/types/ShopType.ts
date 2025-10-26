export enum ShopTypeEnum {
    CAFE = "cafe",
    RESTAURANT = "restaurant",
    SHOP = "shop",
}

export interface ShopType {
    establishment_id: number;
    name: string;
    email: string;
    phone: string;
    type: ShopTypeEnum;
    address: string;
}
