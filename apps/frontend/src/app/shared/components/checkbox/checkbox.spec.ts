import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
    let component: Checkbox;
    let fixture: ComponentFixture<Checkbox>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Checkbox],
            providers: [...appConfig.providers],
        }).compileComponents();

        fixture = TestBed.createComponent(Checkbox);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
