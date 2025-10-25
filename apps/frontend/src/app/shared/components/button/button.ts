import { CommonModule } from "@angular/common";
import { Component, input, InputSignal } from "@angular/core";

@Component({
    selector: "app-button",
    imports: [CommonModule],
    templateUrl: "./button.html",
    styleUrl: "./button.css",
})
export class Button {
    public label: InputSignal<string> = input<string>("");
    public icon: InputSignal<string> = input<string>("");
    public type: InputSignal<"primary" | "primary-line"> = input<"primary" | "primary-line">("primary");
    public isDisabled: InputSignal<boolean> = input<boolean>(false);
    public isFullWidth: InputSignal<boolean> = input<boolean>(false);
}
