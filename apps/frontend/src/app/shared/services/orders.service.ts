import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { OrderItemType, OrderType } from "@shared/types/OrderType";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class OrdersService {
    private httpClient: HttpClient = inject(HttpClient);

    public getOrders(): Promise<OrderType[]> {
        return firstValueFrom(this.httpClient.get<OrderType[]>(environment.serverUrl + "/orders"));
    }

    public getOrderById(orderId: number): Promise<OrderType> {
        return firstValueFrom(this.httpClient.get<OrderType>(environment.serverUrl + `/orders/${orderId}`));
    }

    public createOrder(order: Pick<OrderType, "status" | "date"> & { establishment_id: number }): Promise<OrderType> {
        return firstValueFrom(this.httpClient.post<OrderType>(environment.serverUrl + "/orders", order));
    }

    public updateOrder(
        orderId: number,
        orderData: Pick<OrderType, "status"> & { establishment_id: number },
    ): Promise<OrderType> {
        return firstValueFrom(
            this.httpClient.patch<OrderType>(environment.serverUrl + `/orders/${orderId}`, orderData),
        );
    }

    public deleteOrder(orderId: number): Promise<void> {
        return firstValueFrom(this.httpClient.delete<void>(environment.serverUrl + `/orders/${orderId}`));
    }

    public addOrderItem(
        orderId: number,
        orderItemData: Pick<OrderItemType, "quantity"> & { product_id: number },
    ): Promise<OrderItemType> {
        return firstValueFrom(
            this.httpClient.post<OrderItemType>(environment.serverUrl + `/orders/${orderId}/products`, orderItemData),
        );
    }

    public updateOrderItem(
        orderId: number,
        productId: number,
        orderItemData: Pick<OrderItemType, "quantity">,
    ): Promise<OrderItemType> {
        return firstValueFrom(
            this.httpClient.patch<OrderItemType>(
                environment.serverUrl + `/orders/${orderId}/products/${productId}`,
                orderItemData,
            ),
        );
    }

    public removeOrderItem(orderId: number, productId: number): Promise<void> {
        return firstValueFrom(
            this.httpClient.delete<void>(environment.serverUrl + `/orders/${orderId}/products/${productId}`),
        );
    }
}
