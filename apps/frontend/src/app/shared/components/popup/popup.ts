import { NgClass } from "@angular/common";
import { Component, effect, ElementRef, HostListener, input, InputSignal, model, ModelSignal, output, OutputEmitterRef, Signal, viewChild } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Title } from "@shared/components/title/title";

@Component({
    selector: "ui-popup",
    imports: [Title, Button, NgClass],
    templateUrl: "./popup.html",
    styleUrl: "./popup.css",
})
export class Popup {
    public isOpen: ModelSignal<boolean> = model<boolean>(false);
    public title: InputSignal<string> = input<string>("");

    public closePopup: OutputEmitterRef<void> = output();

    protected popupContent: Signal<ElementRef<HTMLDivElement>> = viewChild.required<ElementRef<HTMLDivElement>>("popupContent");

    constructor() {
        effect(() => {
            const isPopupOpen: boolean = this.isOpen();

            if (isPopupOpen) {
                document.body.style.overflow = "hidden";
            }
            else {
                document.body.style.overflow = "";
            }
        });
    }

    protected onCloseButtonClick(): void {
        this.isOpen.set(false);

        this.closePopup.emit();
    }

    @HostListener("document:click", ["$event"])
    protected onBackdropClick(event: MouseEvent): void {
        if (!this.isOpen()) {
            return;
        }

        const targetNode: Node | null = event.target as Node | null;

        if (targetNode && this.popupContent().nativeElement.contains(targetNode)) {
            return;
        }

        this.onCloseButtonClick();
    }

    @HostListener("document:keydown", ["$event"])
    protected onDocumentKeyDown(event: KeyboardEvent): void {
        if (!this.isOpen()) {
            return;
        }

        if (event.key === "Escape" || event.key === "Esc") {
            event.preventDefault();

            this.onCloseButtonClick();
        }
    }
}
