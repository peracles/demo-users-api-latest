import { Component, Input } from '@angular/core';

type AlertVariant = 'default' | 'destructive';

const variantClasses: Record<AlertVariant, string> = {
  default: 'bg-white text-slate-900 border-slate-200',
  destructive: 'border-red-200 bg-red-50 text-red-700',
};

@Component({
  selector: 'ui-alert',
  standalone: true,
  template: `
    <div [class]="alertClasses" role="alert">
      <ng-content />
    </div>
  `,
})
export class AlertComponent {
  @Input() variant: AlertVariant = 'default';

  get alertClasses(): string {
    return [
      'relative w-full rounded-lg border p-4 text-sm',
      variantClasses[this.variant],
    ].join(' ');
  }
}
