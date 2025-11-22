import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Auth } from "./auth";

describe("Auth", () => {
    let component: Auth;
    let fixture: ComponentFixture<Auth>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Auth],
            providers: [...appConfig.providers],
        }).compileComponents();

        fixture = TestBed.createComponent(Auth);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
