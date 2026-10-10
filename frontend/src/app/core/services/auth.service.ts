import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { AuthResponse, CurrentUser, LoginRequest, RegisterOrgRequest } from '../models/auth.model';
import { PermissionCode } from '../constants/permissions.constant';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;
  private _currentUser = signal<CurrentUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);
  readonly permissions = computed(
    () => this._currentUser()?.role?.permissions?.map((p) => p.code) ?? [],
  );

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService,
  ) {
    const saved = this.storage.getUser<CurrentUser>();
    if (saved && this.storage.getToken()){
      this._currentUser.set(saved);
    }
  }

  hasPermission(code: PermissionCode): boolean {
    return this.permissions().includes(code);
  }
  hasAnyPermission(...codes: PermissionCode[]): boolean {
    return codes.some((c) => this.hasPermission(c));
  }

  login(body: LoginRequest): Observable<{ success: boolean; data: AuthResponse }> {
    return this.http
      .post<{ success: boolean; data: AuthResponse }>(`${this.api}/auth/login`, body)
      .pipe(
        tap((res) => {
          if (res.data) {
            this.storage.setToken(res.data.accessToken);
            this.storage.setUser(res.data.user);
            this._currentUser.set(res.data.user);
          }
        }),
      );
  }

  register(body: RegisterOrgRequest): Observable<unknown> {
    return this.http.post(`${this.api}/auth/register-organization`, body);
  }

  logout(): void {
    this.storage.clear();
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
