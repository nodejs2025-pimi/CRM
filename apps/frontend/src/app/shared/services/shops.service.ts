import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ShopType } from "@shared/types/ShopType";
import { firstValueFrom } from "rxjs";
import {environment} from "@shared/environments/environment";

@Injectable({
    providedIn: "root"
})
export class ShopsService {
    private httpClient: HttpClient = inject(HttpClient);

    public getShops(): Promise<ShopType[]> {
        return firstValueFrom(this.httpClient.get<ShopType[]>(environment.serverUrl + "/establishments"));
    }

    public getShopById(id: number): Promise<ShopType> {
        return firstValueFrom(this.httpClient.get<ShopType>(`${environment.serverUrl}/establishments/${id}`));
    }

    public createShop(shop: Omit<ShopType, "establishment_id">): Promise<ShopType> {
        return firstValueFrom(this.httpClient.post<ShopType>(`${environment.serverUrl}/establishments`, shop));
    }

    public updateShop(id: number, shop: Partial<Omit<ShopType, "establishment_id">>): Promise<ShopType> {
        return firstValueFrom(this.httpClient.patch<ShopType>(`${environment.serverUrl}/establishments/${id}`, shop));
    }

    public deleteShop(id: number): Promise<void> {
        return firstValueFrom(this.httpClient.delete<void>(`${environment.serverUrl}/establishments/${id}`));
    }
}
