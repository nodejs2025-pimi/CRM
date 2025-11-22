import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Shops } from "./shops";

describe("Shops", () => {
    let component: Shops;
    let fixture: ComponentFixture<Shops>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Shops],
            providers: [...appConfig.providers],
        }).compileComponents();

        fixture = TestBed.createComponent(Shops);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
