import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ButtonComponent } from './shared/ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ButtonComponent],
  template: `
    @if (authService.isAuthenticated()) {
      <nav class="border-b border-slate-200 bg-white">
        <div class="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <a routerLink="/dashboard" class="text-xl font-bold tracking-tight text-slate-900">Users API Demo</a>
          <div class="flex items-center gap-4">
            <span class="text-sm text-slate-500">{{ authService.getUser()?.email }}</span>
            <ui-button variant="outline" size="sm" (btnClick)="onLogout()">
              Logout
            </ui-button>
          </div>
        </div>
      </nav>
    }
    <main>
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout();
  }
}
