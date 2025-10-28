import { Component, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Title } from "@shared/components/title/title";
import { ShopsService } from "@shared/services/shops.service";
import { ShopType, ShopTypeEnum } from "@shared/types/ShopType";
import { Popup } from "@shared/components/popup/popup";
import { Input } from "@shared/components/input/input";
import { Select } from "@shared/components/select/select";

@Component({
    selector: "app-shops",
    imports: [Title, Button, Popup, Input, Select],
    templateUrl: "./shops.html",
    styleUrl: "./shops.css",
})
export class Shops implements OnInit {
    protected shops: WritableSignal<ShopType[]> = signal([]);

    protected readonly ShopTypeEnum = ShopTypeEnum;

    protected isShopCreationPopupOpen: WritableSignal<boolean> = signal(false);
    protected isShopEditingPopupOpen: WritableSignal<boolean> = signal(false);

    protected popupTitle: WritableSignal<string> = signal("");

    protected editingShopId: WritableSignal<number | null> = signal(null);

    protected shopName: WritableSignal<string> = signal("");
    protected shopPhone: WritableSignal<string> = signal("");
    protected shopEmail: WritableSignal<string> = signal("");
    protected shopType: WritableSignal<ShopTypeEnum> = signal(ShopTypeEnum.SHOP);
    protected shopAddress: WritableSignal<string> = signal("");

    private shopsService: ShopsService = inject(ShopsService);

    ngOnInit(): void {
        this.loadShops();
    }

    private loadShops(): void {
        this.shopsService.getShops()
            .then((fetchedShops: ShopType[]) => {
                this.shops.set(fetchedShops);
            });
    }

    protected openShopCreationPopup(): void {
        this.shopName.set("");
        this.shopPhone.set("");
        this.shopEmail.set("");
        this.shopType.set(ShopTypeEnum.SHOP);
        this.shopAddress.set("");

        this.popupTitle.set("Create New Establishment");
        this.isShopCreationPopupOpen.set(true);
    }

    protected createShop(event: Event): void {
        event.preventDefault();

        const newShop: Omit<ShopType, "establishment_id"> = {
            name: this.shopName(),
            phone: "+38" + this.shopPhone(),
            email: this.shopEmail(),
            type: this.shopType(),
            address: this.shopAddress(),
        };

        this.shopsService.createShop(newShop)
            .then(() => {
                this.loadShops();
                this.isShopCreationPopupOpen.set(false);
            });
    }

    protected editShop(id: number): void {
        const shopToEdit: ShopType | undefined = this.shops().find((shop: ShopType) => shop.establishment_id === id);

        if (!shopToEdit) {
            return;
        }

        this.editingShopId.set(id);

        this.shopName.set(shopToEdit.name);
        this.shopPhone.set(shopToEdit.phone.replace("+38", ""));
        this.shopEmail.set(shopToEdit.email);
        this.shopType.set(shopToEdit.type);
        this.shopAddress.set(shopToEdit.address);

        this.popupTitle.set("Edit Establishment");
        this.isShopEditingPopupOpen.set(true);
    }

    protected updateShop(event: Event): void {
        event.preventDefault();

        const updatedShopData: Omit<ShopType, "establishment_id"> = {
            name: this.shopName(),
            phone: "+38" + this.shopPhone(),
            email: this.shopEmail(),
            type: this.shopType(),
            address: this.shopAddress(),
        };

        this.shopsService.updateShop(this.editingShopId()!, updatedShopData)
            .then(() => {
                this.loadShops();
                this.isShopEditingPopupOpen.set(false);
            });
    }

    protected onPopupClose(): void {
        this.isShopCreationPopupOpen.set(false);
        this.isShopEditingPopupOpen.set(false);
    }

    protected deleteShop(id: number): void {
        this.shopsService.deleteShop(id)
            .then(() => {
                this.loadShops();
            });
    }
}
