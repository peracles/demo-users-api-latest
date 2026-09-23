import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-label',
  standalone: true,
  template: `
    <label [class]="labelClasses">
      <ng-content />
    </label>
  `,
})
export class LabelComponent {
  @Input() htmlFor = '';

  get labelClasses(): string {
    return 'text-sm font-medium leading-none text-slate-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
  }
}
