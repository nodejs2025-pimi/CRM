import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
    selector: "app-layout-sidebar",
    imports: [RouterLink, RouterLinkActive],
    templateUrl: "./sidebar.html",
    styleUrl: "./sidebar.css",
})
export class Sidebar {
    protected logout(): void {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
    }
}
