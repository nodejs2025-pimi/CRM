import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Analytics } from "./analytics";

describe("Analytics", () => {
    let component: Analytics;
    let fixture: ComponentFixture<Analytics>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Analytics],
            providers: [...appConfig.providers],
        }).compileComponents();

        fixture = TestBed.createComponent(Analytics);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
