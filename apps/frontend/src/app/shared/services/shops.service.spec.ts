import { TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { ShopsService } from "./shops.service";

describe("ShopsService", () => {
    let service: ShopsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [...appConfig.providers],
        });
        service = TestBed.inject(ShopsService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
