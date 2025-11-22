import { TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { AuthService } from "./auth.service";

describe("AuthService", () => {
    let service: AuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [...appConfig.providers]
        });
        service = TestBed.inject(AuthService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
