import { HttpInterceptorFn, HttpRequest } from "@angular/common/http";

export const interceptor: HttpInterceptorFn = (req, next) => {
    const newRequest: HttpRequest<unknown> = req.clone({
        setHeaders: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
    });
    
    return next(newRequest);
};
