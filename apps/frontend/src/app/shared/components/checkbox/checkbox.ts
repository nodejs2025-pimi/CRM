import { Component, input, InputSignal, model, ModelSignal, output, OutputEmitterRef } from "@angular/core";

@Component({
    selector: "ui-checkbox",
    imports: [],
    templateUrl: "./checkbox.html",
    styleUrl: "./checkbox.css",
})
export class Checkbox {
    public readonly value: ModelSignal<boolean | undefined> = model<boolean | undefined>(false);
    public readonly label: InputSignal<string> = input<string>("");
    public isDisabled: InputSignal<boolean> = input<boolean>(false);

    public readonly changeCheckbox: OutputEmitterRef<Event> = output<Event>();

    protected onChange(event: Event): void {
        const newValue: boolean = (event.target as HTMLInputElement).checked;
        this.value.set(newValue);

        event.preventDefault();
        event.stopPropagation();
        this.changeCheckbox.emit(event);
    }
}
