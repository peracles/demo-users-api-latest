import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  ButtonComponent,
  InputComponent,
  LabelComponent,
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
  CardFooterComponent,
  AlertComponent,
} from '../../shared/ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    InputComponent,
    LabelComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    CardFooterComponent,
    AlertComponent,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <ui-card class="w-full max-w-md">
        <ui-card-header class="text-center">
          <ui-card-title>Iniciar Sesion</ui-card-title>
          <ui-card-description>Ingresa tus credenciales para acceder al dashboard</ui-card-description>
        </ui-card-header>
        <ui-card-content>
          @if (error) {
            <ui-alert variant="destructive" class="mb-4">
              {{ error }}
            </ui-alert>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="space-y-2">
              <ui-label>Email</ui-label>
              <ui-input
                type="email"
                formControlName="email"
                placeholder="admin@demo.com"
              />
            </div>

            <div class="space-y-2">
              <ui-label>Password</ui-label>
              <ui-input
                type="password"
                formControlName="password"
                placeholder="admin123"
              />
            </div>

            <ui-button
              type="submit"
              [disabled]="form.invalid || loading"
              class="w-full"
            >
              @if (loading) { Entrando... } @else { Entrar }
            </ui-button>
          </form>
        </ui-card-content>
        <ui-card-footer class="flex-col space-y-2">
          <p class="text-sm text-slate-500">
            No tienes cuenta?
            <a routerLink="/register" class="text-indigo-600 hover:underline font-medium">
              Registrate
            </a>
          </p>
          <div class="w-full mt-2 p-3 bg-slate-100 rounded-md text-xs text-slate-500">
            <p class="font-semibold mb-1">Usuarios demo:</p>
            <p>admin&#64;demo.com / admin123 (ADMIN)</p>
            <p>carlos&#64;demo.com / user123 (USER)</p>
          </div>
        </ui-card-footer>
      </ui-card>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.authService.login(this.form.value as any).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err.error?.message || 'Credenciales invalidas';
      },
    });
  }
}
