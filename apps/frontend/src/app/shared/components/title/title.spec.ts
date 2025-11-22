import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Title } from "./title";

describe("Title", () => {
    let component: Title;
    let fixture: ComponentFixture<Title>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Title],
            providers: [...appConfig.providers],
        }).compileComponents();

        fixture = TestBed.createComponent(Title);
        component = fixture.componentInstance;
        fixture.componentRef.setInput("title", "Test Title");
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
