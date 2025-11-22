import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Orders } from "./orders";

describe("Orders", () => {
    let component: Orders;
    let fixture: ComponentFixture<Orders>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Orders],
            providers: [...appConfig.providers],
        }).compileComponents();

        fixture = TestBed.createComponent(Orders);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
