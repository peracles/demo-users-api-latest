import { Component, Input } from '@angular/core';

type AlertVariant = 'default' | 'destructive';

const variantClasses: Record<AlertVariant, string> = {
  default: 'bg-background text-foreground',
  destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
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
      'relative w-full rounded-lg border border-border p-4 text-sm',
      variantClasses[this.variant],
    ].join(' ');
  }
}
