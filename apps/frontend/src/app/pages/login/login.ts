import { Component, inject, signal, WritableSignal } from "@angular/core";
import { Router } from "@angular/router";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { Title } from "@shared/components/title/title";
import { AuthService } from "@shared/services/auth.service";

@Component({
    selector: "app-login",
    imports: [Title, Button, Input],
    templateUrl: "./login.html",
    styleUrl: "./login.css",
})
export class Login {
    protected username: WritableSignal<string> = signal("");
    protected password: WritableSignal<string> = signal("");

    private authService: AuthService = inject(AuthService);
    private router: Router = inject(Router);

    protected submit(event: Event): void {
        event.preventDefault();

        const user: { username: string; password: string } = {
            username: this.username(),
            password: this.password(),
        };

        this.authService.login(user).then(() => {
            this.router.navigate(["/"]);
        });
    }
}
