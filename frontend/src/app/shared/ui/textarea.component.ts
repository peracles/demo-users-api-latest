import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-textarea',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
  template: `
    <textarea
      [placeholder]="placeholder"
      [value]="value"
      [disabled]="disabled"
      [rows]="rows"
      [class]="textareaClasses"
      (input)="onInput($event)"
      (blur)="onTouched()"
    ></textarea>
  `,
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() rows = 3;
  value = '';
  disabled = false;

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  get textareaClasses(): string {
    return [
      'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ].join(' ');
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
