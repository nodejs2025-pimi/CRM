import { Component, OnInit, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Title } from "@shared/components/title/title";
import { ShopType, ShopTypeEnum } from "@shared/types/ShopType";

@Component({
    selector: "app-shops",
    imports: [Title, Button],
    templateUrl: "./shops.html",
    styleUrl: "./shops.css",
})
export class Shops implements OnInit {
    protected shops: WritableSignal<ShopType[]> = signal([]);

    protected readonly ShopTypeEnum = ShopTypeEnum;

    ngOnInit() {
        this.loadShops();
    }

    private loadShops() {
        const fetchedShops: ShopType[] = [
            {
                establishment_id: 1,
                name: "Shop 1",
                phone: "0991234567",
                email: "shop1@example.com",
                type: ShopTypeEnum.SHOP,
                address: "Location 1",
            },
            {
                establishment_id: 2,
                name: "Shop 2",
                phone: "0991234567",
                email: "shop2@example.com",
                type: ShopTypeEnum.SHOP,
                address: "Location 2",
            },
            {
                establishment_id: 3,
                name: "Cafe 1",
                phone: "0991234567",
                email: "cafe1@example.com",
                type: ShopTypeEnum.CAFE,
                address: "Location 3",
            },
            {
                establishment_id: 4,
                name: "Restaurant 1",
                phone: "0991234567",
                email: "restaurant1@example.com",
                type: ShopTypeEnum.RESTAURANT,
                address: "Location 4",
            },
        ];

        this.shops.set(fetchedShops);
    }
}
