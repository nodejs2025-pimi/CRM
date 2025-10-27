import { firstValueFrom } from "rxjs";
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "@shared/services/auth.service";

export const authGuard: CanActivateFn = () => {
    const authService: AuthService = inject(AuthService);
    const router: Router = inject(Router);

    const token: string | null = localStorage.getItem("token");

    if (!token) {
        const refreshToken: string | null = localStorage.getItem("refreshToken");

        if (!refreshToken) {
            return router.navigate(["/auth"]);
        }

        firstValueFrom(authService.refreshToken(refreshToken))
            .then(() => {
                return true;
            })
            .catch(() => {
                return router.navigate(["/auth"]);
            });
    }

    return true;
};
