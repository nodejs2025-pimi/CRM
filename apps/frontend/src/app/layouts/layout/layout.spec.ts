import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Layout } from "./layout";

describe("Layout", () => {
    let component: Layout;
    let fixture: ComponentFixture<Layout>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Layout],
            providers: [...appConfig.providers],
        }).compileComponents();

        fixture = TestBed.createComponent(Layout);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
