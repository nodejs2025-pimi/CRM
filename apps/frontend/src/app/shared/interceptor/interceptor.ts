import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "@shared/services/auth.service";
import { catchError, switchMap, throwError } from "rxjs";

export const interceptor: HttpInterceptorFn = (req, next) => {
    const authService: AuthService = inject(AuthService);

    const newRequest: HttpRequest<unknown> = req.clone({
        setHeaders: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
    });

    return next(newRequest)
        .pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status == 401) {
                    const refreshToken: string | null = localStorage.getItem("refreshToken");

                    if (refreshToken) {
                        return authService.refreshToken(refreshToken)
                            .pipe(
                                switchMap(() => next(newRequest)),
                                catchError((refreshError) => {
                                    localStorage.removeItem("token");
                                    return throwError(() => refreshError);
                                })
                            );
                    }
                }

                return throwError(() => error);
            })
        );
};
