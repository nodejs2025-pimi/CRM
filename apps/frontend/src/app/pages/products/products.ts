import { CurrencyPipe, NgClass } from "@angular/common";
import { Component, effect, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { Popup } from "@shared/components/popup/popup";
import { Title } from "@shared/components/title/title";
import { ProductsService } from "@shared/services/products.service";
import { ProductType } from "@shared/types/ProductType";

@Component({
    selector: "app-products",
    imports: [Title, Button, CurrencyPipe, NgClass, Input, Popup],
    templateUrl: "./products.html",
    styleUrl: "./products.css",
})
export class Products implements OnInit {
    protected products: WritableSignal<ProductType[]> = signal([]);

    protected orderByField: WritableSignal<"name" | "price" | "available_quantity"> = signal("name");
    protected orderDirection: WritableSignal<"asc" | "desc"> = signal("asc");

    protected searchValue: WritableSignal<string> = signal("");

    protected isProductCreationPopupOpen: WritableSignal<boolean> = signal(false);
    protected isProductEditingPopupOpen: WritableSignal<boolean> = signal(false);

    protected popupTitle: WritableSignal<string> = signal("");

    protected editingProductId: WritableSignal<number | null> = signal(null);

    protected productName: WritableSignal<string> = signal("");
    protected productPrice: WritableSignal<number> = signal(0);
    protected productAvailableQuantity: WritableSignal<number> = signal(0);
    protected productWholesalePrice: WritableSignal<number> = signal(0);
    protected productWholesaleMinimumQuantity: WritableSignal<number> = signal(0);
    protected productIsActive: WritableSignal<boolean> = signal(true);

    private productsService: ProductsService = inject(ProductsService);

    constructor() {
        effect(() => {
            this.searchValue();
            this.orderByField();
            this.orderDirection();

            this.loadProducts();
        });
    }

    ngOnInit(): void {
        this.loadProducts();
    }

    private loadProducts(): void {
        this.productsService.getProducts(this.orderByField(), this.orderDirection(), this.searchValue())
            .then((fetchedProducts: ProductType[]) => {
                this.products.set(fetchedProducts);
            });
    }

    protected orderBy(field: "name" | "price" | "available_quantity"): void {
        if (this.orderByField() === field) {
            this.orderDirection.set(this.orderDirection() === "asc" ? "desc" : "asc");
        }
        else {
            this.orderByField.set(field);
            this.orderDirection.set("asc");
        }
    }

    protected openProductCreationPopup(): void {
        this.productName.set("");
        this.productPrice.set(0);
        this.productAvailableQuantity.set(0);
        this.productWholesalePrice.set(0);
        this.productWholesaleMinimumQuantity.set(0);
        this.productIsActive.set(true);

        this.popupTitle.set("Create New Product");
        this.isProductCreationPopupOpen.set(true);
    }

    protected createProduct(event: Event): void {
        event.preventDefault();

        const newProduct: Omit<ProductType, "product_id"> = {
            name: this.productName(),
            price: this.productPrice(),
            available_quantity: this.productAvailableQuantity(),
            wholesale_price: this.productWholesalePrice(),
            wholesale_minimum_quantity: this.productWholesaleMinimumQuantity(),
            is_active: this.productIsActive(),
        };

        this.productsService.createProduct(newProduct)
            .then(() => {
                this.loadProducts();
                this.isProductCreationPopupOpen.set(false);
            });
    }

    protected editProduct(id: number): void {
        const productToEdit: ProductType | undefined = this.products().find((product: ProductType) => product.product_id === id);

        if (!productToEdit) {
            return;
        }

        this.editingProductId.set(id);

        this.productName.set(productToEdit.name);
        this.productPrice.set(productToEdit.price);
        this.productAvailableQuantity.set(productToEdit.available_quantity);
        this.productWholesalePrice.set(productToEdit.wholesale_price);
        this.productWholesaleMinimumQuantity.set(productToEdit.wholesale_minimum_quantity);
        this.productIsActive.set(productToEdit.is_active);

        this.popupTitle.set("Edit Product");
        this.isProductEditingPopupOpen.set(true);
    }

    protected updateProduct(event: Event): void {
        event.preventDefault();

        const updatedProductData: Omit<ProductType, "product_id"> = {
            name: this.productName(),
            price: this.productPrice(),
            available_quantity: this.productAvailableQuantity(),
            wholesale_price: this.productWholesalePrice(),
            wholesale_minimum_quantity: this.productWholesaleMinimumQuantity(),
            is_active: this.productIsActive(),
        };

        this.productsService.updateProduct(this.editingProductId()!, updatedProductData)
            .then(() => {
                this.loadProducts();

                this.isProductEditingPopupOpen.set(false);
            });
    }

    protected onPopupClose(): void {
        this.isProductCreationPopupOpen.set(false);
        this.isProductEditingPopupOpen.set(false);
    }

    protected deleteProduct(id: number): void {
        this.productsService.deleteProduct(id)
            .then(() => {
                this.loadProducts();
            });
    }
}
