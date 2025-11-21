import { TestBed } from "@angular/core/testing";
import { HttpInterceptorFn } from "@angular/common/http";

import { interceptor as interceptorFn } from "./interceptor";

describe("interceptor", () => {
    const interceptor: HttpInterceptorFn = (req, next) => TestBed.runInInjectionContext(() => interceptorFn(req, next));

    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

    it("should be created", () => {
        expect(interceptor).toBeTruthy();
    });
});
