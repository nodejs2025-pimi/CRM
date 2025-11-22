import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Products } from "./products";

describe("Products", () => {
    let component: Products;
    let fixture: ComponentFixture<Products>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Products],
            providers: [...appConfig.providers],
        }).compileComponents();

        fixture = TestBed.createComponent(Products);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
