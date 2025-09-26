import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Sidebar } from "@components/layout/sidebar/sidebar";

@Component({
    selector: "app-layout",
    imports: [RouterOutlet, Sidebar],
    templateUrl: "./layout.html",
    styleUrl: "./layout.css",
})
export class Layout {}
