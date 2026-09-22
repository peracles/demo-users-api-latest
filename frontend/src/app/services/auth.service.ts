import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserPayload,
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly API = '/api/auth';

  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  isAuthenticated(): boolean {
    return this.loggedIn$.value;
  }

  isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  getUser(): UserPayload | null {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    return this.decodeToken(token);
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API}/login`, req)
      .pipe(tap((res) => this.persistTokens(res)));
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API}/register`, req)
      .pipe(tap((res) => this.persistTokens(res)));
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      this.http.post(`${this.API}/logout`, { refreshToken }).subscribe();
    }
    this.clearSession();
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken')!;
    return this.http
      .post<AuthResponse>(`${this.API}/refresh`, { refreshToken })
      .pipe(tap((res) => this.persistTokens(res)));
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private persistTokens(res: AuthResponse): void {
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    this.loggedIn$.next(true);
  }

  private clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.loggedIn$.next(false);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  private decodeToken(token: string): UserPayload {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }
}
