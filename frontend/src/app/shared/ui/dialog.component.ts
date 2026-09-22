import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-dialog',
  standalone: true,
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div
          class="fixed inset-0 bg-black/80 animate-in fade-in-0"
          (click)="closed.emit()"
        ></div>
        <div
          class="relative z-50 w-full max-w-lg mx-4 bg-background rounded-lg border border-border shadow-lg p-6"
        >
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class DialogComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
}

@Component({
  selector: 'ui-dialog-header',
  standalone: true,
  template: `<div class="flex flex-col space-y-1.5 text-center sm:text-left mb-4"><ng-content /></div>`,
})
export class DialogHeaderComponent {}

@Component({
  selector: 'ui-dialog-title',
  standalone: true,
  template: `<h2 class="text-lg font-semibold leading-none tracking-tight"><ng-content /></h2>`,
})
export class DialogTitleComponent {}

@Component({
  selector: 'ui-dialog-footer',
  standalone: true,
  template: `<div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6"><ng-content /></div>`,
})
export class DialogFooterComponent {}
