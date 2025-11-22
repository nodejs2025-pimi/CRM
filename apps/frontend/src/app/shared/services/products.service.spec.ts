import { TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { ProductsService } from "./products.service";

describe("ProductsService", () => {
    let service: ProductsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [...appConfig.providers],
        });
        service = TestBed.inject(ProductsService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
