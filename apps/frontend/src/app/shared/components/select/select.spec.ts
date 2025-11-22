import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Select } from "./select";

describe("Select", () => {
    let component: Select;
    let fixture: ComponentFixture<Select>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Select],
            providers: [...appConfig.providers],
        }).compileComponents();

        fixture = TestBed.createComponent(Select);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
