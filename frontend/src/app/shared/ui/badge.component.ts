import { Component, Input } from '@angular/core';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive text-destructive-foreground',
  outline: 'text-foreground border-border',
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
      'transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      variantClasses[this.variant],
    ].join(' ');
  }
}
