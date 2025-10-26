import { CommonModule, CurrencyPipe } from "@angular/common";
import { Component, OnInit, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Title } from "@shared/components/title/title";
import { ProductType } from "@shared/types/ProductType";

@Component({
    selector: "app-products",
    imports: [Title, Button, CurrencyPipe, CommonModule],
    templateUrl: "./products.html",
    styleUrl: "./products.css",
})
export class Products implements OnInit {
    protected products: WritableSignal<ProductType[]> = signal([]);

    protected orderByField: WritableSignal<"name" | "price" | "available_quantity"> = signal("name");
    protected orderDirection: WritableSignal<"asc" | "desc"> = signal("asc");

    protected searchValue: WritableSignal<string> = signal("");

    ngOnInit() {
        this.loadProducts();
    }

    private loadProducts() {
        const fetchedProducts: ProductType[] = [
            {
                product_id: 1,
                name: "Product 1",
                price: 100,
                wholesale_price: 80,
                wholesale_minimum_quantity: 10,
                available_quantity: 50,
                is_active: true,
            },
            {
                product_id: 2,
                name: "Product 2",
                price: 200,
                wholesale_price: 150,
                wholesale_minimum_quantity: 5,
                available_quantity: 20,
                is_active: true,
            },
            {
                product_id: 3,
                name: "Product 3",
                price: 150,
                wholesale_price: 120,
                wholesale_minimum_quantity: 8,
                available_quantity: 0,
                is_active: false,
            },
            {
                product_id: 4,
                name: "Product 4",
                price: 250,
                wholesale_price: 200,
                wholesale_minimum_quantity: 12,
                available_quantity: 30,
                is_active: true,
            }
        ];

        this.products.set(fetchedProducts);
    }

    protected orderBy(field: "name" | "price" | "available_quantity") {
        if (this.orderByField() === field) {
            this.orderDirection.set(this.orderDirection() === "asc" ? "desc" : "asc");
        }
        else {
            this.orderByField.set(field);
            this.orderDirection.set("asc");
        }
    }
}
