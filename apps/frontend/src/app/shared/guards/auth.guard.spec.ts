import { TestBed } from "@angular/core/testing";
import { CanActivateFn } from "@angular/router";
import { appConfig } from "app.config";

import { authGuard } from "./auth.guard";

describe("authGuard", () => {
    const executeGuard: CanActivateFn = (...guardParameters) =>
        TestBed.runInInjectionContext(() => authGuard(...guardParameters));

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [...appConfig.providers],
        });
    });

    it("should be created", () => {
        expect(executeGuard).toBeTruthy();
    });
});
