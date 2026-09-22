import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  template: `
    <span [class]="avatarClasses">
      {{ initials }}
    </span>
  `,
})
export class AvatarComponent {
  @Input() firstName = '';
  @Input() lastName = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get initials(): string {
    const f = this.firstName?.[0] ?? '';
    const l = this.lastName?.[0] ?? '';
    return (f + l).toUpperCase();
  }

  get avatarClasses(): string {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-14 h-14 text-lg',
    };
    return [
      'relative flex shrink-0 overflow-hidden rounded-full',
      'bg-primary/10 text-primary font-medium items-center justify-center',
      sizes[this.size],
    ].join(' ');
  }
}
