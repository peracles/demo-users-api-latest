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
  selector: 'app-register',
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
    <div class="min-h-screen flex items-center justify-center px-4 bg-muted/40">
      <ui-card class="w-full max-w-md">
        <ui-card-header class="text-center">
          <ui-card-title>Crear Cuenta</ui-card-title>
          <ui-card-description>Registra tus datos para comenzar</ui-card-description>
        </ui-card-header>
        <ui-card-content>
          @if (error) {
            <ui-alert variant="destructive" class="mb-4">
              {{ error }}
            </ui-alert>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="space-y-2">
              <ui-label>Username</ui-label>
              <ui-input
                type="text"
                formControlName="username"
                placeholder="carlos"
              />
              @if (form.get('username')?.touched && form.get('username')?.errors?.['required']) {
                <p class="text-destructive text-xs">Username es requerido</p>
              }
              @if (form.get('username')?.errors?.['minlength']) {
                <p class="text-destructive text-xs">Minimo 3 caracteres</p>
              }
            </div>

            <div class="space-y-2">
              <ui-label>Email</ui-label>
              <ui-input
                type="email"
                formControlName="email"
                placeholder="carlos@demo.com"
              />
              @if (form.get('email')?.touched && form.get('email')?.errors?.['email']) {
                <p class="text-destructive text-xs">Email invalido</p>
              }
            </div>

            <div class="space-y-2">
              <ui-label>Password</ui-label>
              <ui-input
                type="password"
                formControlName="password"
                placeholder="minimo 6 caracteres"
              />
              @if (form.get('password')?.touched && form.get('password')?.errors?.['minlength']) {
                <p class="text-destructive text-xs">Minimo 6 caracteres</p>
              }
            </div>

            <ui-button
              type="submit"
              [disabled]="form.invalid || loading"
              class="w-full"
            >
              @if (loading) { Creando... } @else { Crear Cuenta }
            </ui-button>
          </form>
        </ui-card-content>
        <ui-card-footer>
          <p class="text-sm text-muted-foreground">
            Ya tienes cuenta?
            <a routerLink="/login" class="text-primary hover:underline font-medium">
              Inicia sesion
            </a>
          </p>
        </ui-card-footer>
      </ui-card>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.authService.register(this.form.value as any).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al crear cuenta';
      },
    });
  }
}
