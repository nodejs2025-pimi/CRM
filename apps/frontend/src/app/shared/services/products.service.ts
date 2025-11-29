import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@shared/environments/environment.development";
import { ProductType } from "@shared/types/ProductType";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class ProductsService {
    private httpClient: HttpClient = inject(HttpClient);

    public getProducts(sortBy: string, orderBy: string, searchValue: string): Promise<ProductType[]> {
        return firstValueFrom(
            this.httpClient.get<ProductType[]>(environment.serverUrl + "/products", {
                params: {
                    sort: sortBy,
                    order: orderBy,
                    search: searchValue,
                },
            }),
        );
    }

    public getProductById(id: number): Promise<ProductType> {
        return firstValueFrom(this.httpClient.get<ProductType>(`${environment.serverUrl}/products/${id}`));
    }

    public createProduct(product: Omit<ProductType, "product_id">): Promise<ProductType> {
        return firstValueFrom(this.httpClient.post<ProductType>(`${environment.serverUrl}/products`, product));
    }

    public updateProduct(id: number, product: Partial<Omit<ProductType, "product_id">>): Promise<ProductType> {
        return firstValueFrom(this.httpClient.patch<ProductType>(`${environment.serverUrl}/products/${id}`, product));
    }

    public deleteProduct(id: number): Promise<void> {
        return firstValueFrom(this.httpClient.delete<void>(`${environment.serverUrl}/products/${id}`));
    }
}
