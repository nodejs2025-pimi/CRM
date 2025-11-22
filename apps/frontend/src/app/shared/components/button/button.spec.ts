import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Button } from "./button";

describe("Button", () => {
    let component: Button;
    let fixture: ComponentFixture<Button>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Button],
            providers: [...appConfig.providers],
        }).compileComponents();

        fixture = TestBed.createComponent(Button);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
