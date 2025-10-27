import { firstValueFrom, map, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@shared/environments/environment";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    private httpClient: HttpClient = inject(HttpClient);

    login(data: { username: string; password: string }): Promise<void> {
        return firstValueFrom(this.httpClient.post<{ accessToken: string, refreshToken: string }>(environment.serverUrl + "/auth/login", data))
            .then((response: { accessToken: string; refreshToken: string }) => {
                localStorage.setItem("token", response.accessToken);
                localStorage.setItem("refreshToken", response.refreshToken);
            });
    }

    refreshToken(refreshToken: string): Observable<string> {
        return this.httpClient.post<{ accessToken: string }>(environment.serverUrl + "/auth/refresh", { refreshToken })
            .pipe(
                map((response: { accessToken: string }) => {
                    localStorage.setItem("token", response.accessToken);
                    return response.accessToken;
                })
            );
    }
}
