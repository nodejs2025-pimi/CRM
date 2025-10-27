import { CommonModule } from "@angular/common";
import { Component, computed, input, InputSignal, model, ModelSignal, OnInit, Signal } from "@angular/core";

@Component({
	selector: "ui-input",
	imports: [CommonModule],
	templateUrl: "./input.html",
	styleUrl: "./input.css",
})
export class Input implements OnInit {
	public readonly label: InputSignal<string> = input<string>("");
	public readonly placeholder: InputSignal<string> = input<string>("");
	public readonly type: InputSignal<"text" | "number" | "email" | "phone" | "password"> = input<"text" | "number" | "email" | "phone" | "password">("text");
	public readonly align: InputSignal<"center" | "left" | "right"> = input<"center" | "left" | "right">("left");
	public readonly minNumber: InputSignal<number> = input<number>(0);
	public readonly maxNumber: InputSignal<number> = input<number>(Infinity);
	public readonly name: InputSignal<string> = input<string>("");
	public readonly autocomplete: InputSignal<string> = input<string>("");
	public isDisabled: InputSignal<boolean> = input<boolean>(false);
	public isError: InputSignal<boolean> = input<boolean>(false);

	protected inputType: Signal<"text" | "tel" | "password" | "email"> = computed<"text" | "tel" | "password" | "email">(() => {
		if (this.type() == "password") {
			return "password";
		}
		else if (this.type() == "phone") {
			return "tel";
		}
		else if (this.type() == "email") {
			return "email";
		}
		return "text";
	});

	public value: ModelSignal<string | number> = model<string | number>("");

	ngOnInit(): void {
		if (this.type() == "number" && typeof this.value() !== "number") {
			this.value.set(0);
		}
	}

	handleInput(event: Event): void {
		const target: HTMLInputElement = event.target as HTMLInputElement;
		const newValue: string = target.value;

		if (this.type() == "number") {
			const newNumericValue: number = parseInt(newValue.replaceAll(/[^0-9]/g, "")) || 0;
			target.value = newNumericValue.toString();
		}
		else if (this.type() == "phone") {
			const newPhoneValue: string = newValue.replaceAll(/[^0-9]/g, "").slice(0, 10);
			target.value = newPhoneValue;
			this.value.set(newPhoneValue);
		}
		else {
			this.value.set(newValue);
		}
	}

	onChange(event: Event): void {
		if (this.type() == "number") {
			let newNumericValue: number = parseInt((event.target as HTMLInputElement).value.replaceAll(/[^0-9]/g, "")) || 0;

			if (newNumericValue < this.minNumber()) {
				newNumericValue = this.minNumber();
			}
			else if (newNumericValue > this.maxNumber()) {
				newNumericValue = this.maxNumber();
			}

			this.value.set(newNumericValue);
			(event.target as HTMLInputElement).value = newNumericValue.toString();
		}
	}
}
