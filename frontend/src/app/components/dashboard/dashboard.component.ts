import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { UserService, UserProfile, UpdateUserInput } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import {
  ButtonComponent,
  InputComponent,
  LabelComponent,
  CardComponent,
  CardContentComponent,
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogFooterComponent,
  AvatarComponent,
  BadgeComponent,
  TextareaComponent,
  AlertComponent,
} from '../../shared/ui';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    ButtonComponent,
    InputComponent,
    LabelComponent,
    CardComponent,
    CardContentComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogFooterComponent,
    AvatarComponent,
    BadgeComponent,
    TextareaComponent,
    AlertComponent,
  ],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p class="text-slate-500 mt-1">
            Bienvenido, {{ currentUser()?.firstName }}
          </p>
        </div>
        <ui-badge>{{ currentUser()?.role }}</ui-badge>
      </div>

      @if (loading()) {
        <div class="text-center py-12">
          <p class="text-slate-500">Cargando usuarios...</p>
        </div>
      } @else if (error()) {
        <ui-alert variant="destructive">
          {{ error() }}
        </ui-alert>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (user of users(); track user.id) {
            <ui-card class="hover:shadow-md transition-shadow">
              <ui-card-content class="p-5">
                <div class="flex items-center gap-3 mb-3">
                  <ui-avatar [firstName]="user.firstName" [lastName]="user.lastName" />
                  <div>
                    <h3 class="font-semibold leading-none text-slate-900">
                      {{ user.firstName }} {{ user.lastName }}
                    </h3>
                    @if (user.phone) {
                      <p class="text-sm text-slate-500 mt-0.5">{{ user.phone }}</p>
                    }
                  </div>
                </div>
                @if (user.bio) {
                  <p class="text-sm text-slate-500 mb-3">{{ user.bio }}</p>
                }
                <div class="flex items-center gap-2 pt-3 border-t border-slate-100">
                  @if (canEdit(user)) {
                    <ui-button variant="ghost" size="sm" (btnClick)="openEdit(user)">
                      Editar
                    </ui-button>
                    <ui-button variant="ghost" size="sm" (btnClick)="onDelete(user)">
                      <span class="text-red-600">Eliminar</span>
                    </ui-button>
                  }
                  <span class="text-xs text-slate-400 ml-auto">
                    {{ user.createdAt | date: 'shortDate' }}
                  </span>
                </div>
              </ui-card-content>
            </ui-card>
          }
        </div>
      }

      <ui-dialog [open]="showEditModal()" (closed)="showEditModal.set(false)">
        <ui-dialog-header>
          <ui-dialog-title>Editar Perfil</ui-dialog-title>
        </ui-dialog-header>

        <form [formGroup]="editForm" (ngSubmit)="onSaveEdit()">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <ui-label>Nombre</ui-label>
                <ui-input formControlName="firstName" />
              </div>
              <div class="space-y-2">
                <ui-label>Apellido</ui-label>
                <ui-input formControlName="lastName" />
              </div>
            </div>
            <div class="space-y-2">
              <ui-label>Telefono</ui-label>
              <ui-input formControlName="phone" type="tel" />
            </div>
            <div class="space-y-2">
              <ui-label>Avatar URL</ui-label>
              <ui-input formControlName="avatarUrl" type="url" />
            </div>
            <div class="space-y-2">
              <ui-label>Bio</ui-label>
              <ui-textarea formControlName="bio" placeholder="Cuenta algo sobre ti..." />
            </div>
          </div>

          @if (saveError) {
            <ui-alert variant="destructive" class="mt-4">
              {{ saveError }}
            </ui-alert>
          }

          <ui-dialog-footer>
            <ui-button variant="outline" type="button" (btnClick)="cancelEdit()">
              Cancelar
            </ui-button>
            <ui-button type="submit" [disabled]="saving">
              @if (saving) { Guardando... } @else { Guardar }
            </ui-button>
          </ui-dialog-footer>
        </form>
      </ui-dialog>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  users = signal<UserProfile[]>([]);
  loading = signal(true);
  error = signal('');
  showEditModal = signal(false);
  currentUser = signal<{ firstName: string; userId: string; role: string } | null>(null);
  saving = false;
  saveError = '';

  private editingUser: UserProfile | null = null;

  editForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    phone: [''],
    avatarUrl: [''],
    bio: [''],
  });

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.currentUser.set({
        firstName: user.email.split('@')[0],
        userId: user.sub,
        role: user.role,
      });
    }
    this.loadUsers();
  }

  canEdit(user: UserProfile): boolean {
    const current = this.currentUser();
    if (!current) return false;
    return current.role === 'ADMIN' || current.userId === user.userId;
  }

  openEdit(user: UserProfile): void {
    this.editingUser = user;
    this.editForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? '',
      avatarUrl: user.avatarUrl ?? '',
      bio: user.bio ?? '',
    });
    this.showEditModal.set(true);
  }

  onSaveEdit(): void {
    if (!this.editingUser || this.editForm.invalid) return;
    this.saving = true;
    this.saveError = '';

    const input: UpdateUserInput = {
      ...(this.editForm.value.firstName && {
        firstName: this.editForm.value.firstName,
      }),
      ...(this.editForm.value.lastName && {
        lastName: this.editForm.value.lastName,
      }),
      ...(this.editForm.value.phone && { phone: this.editForm.value.phone }),
      ...(this.editForm.value.avatarUrl && {
        avatarUrl: this.editForm.value.avatarUrl,
      }),
      ...(this.editForm.value.bio && { bio: this.editForm.value.bio }),
    };

    this.userService
      .updateUser(this.editingUser.id, input)
      .subscribe({
        next: () => {
          this.saving = false;
          this.showEditModal.set(false);
          this.loadUsers();
        },
        error: (err) => {
          this.saving = false;
          this.saveError = err.error?.message || 'Error al guardar cambios';
        },
      });
  }

  cancelEdit(): void {
    this.showEditModal.set(false);
    this.saveError = '';
    this.saving = false;
  }

  onDelete(user: UserProfile): void {
    if (!confirm(`Eliminar perfil de ${user.firstName}?`)) return;
    this.userService.deleteUser(user.id).subscribe(() => this.loadUsers());
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar usuarios');
        this.loading.set(false);
      },
    });
  }
}
