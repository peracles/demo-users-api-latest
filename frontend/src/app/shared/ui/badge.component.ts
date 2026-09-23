import { Component, Input } from '@angular/core';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-slate-900 text-white',
  secondary: 'border-transparent bg-slate-100 text-slate-900',
  destructive: 'border-transparent bg-red-600 text-white',
  outline: 'text-slate-900 border-slate-200',
};

@Component({
  selector: 'ui-badge',
  standalone: true,
  template: `
    <span [class]="badgeClasses">
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';

  get badgeClasses(): string {
    return [
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
      'transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
      variantClasses[this.variant],
    ].join(' ');
  }
}
