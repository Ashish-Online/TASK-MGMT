import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly TOKEN_KEY = 'wf_access_token';
  private readonly USER_KEY  = 'wf_current_user';
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  setToken(t: string): void { if (this.isBrowser) localStorage.setItem(this.TOKEN_KEY, t); }
  getToken(): string | null { return this.isBrowser ? localStorage.getItem(this.TOKEN_KEY) : null; }
  clearToken(): void { if (this.isBrowser) localStorage.removeItem(this.TOKEN_KEY); }
  setUser(u: object): void { if (this.isBrowser) localStorage.setItem(this.USER_KEY, JSON.stringify(u)); }
  getUser<T>(): T | null {
    if (!this.isBrowser) return null;
    const r = localStorage.getItem(this.USER_KEY);
    return r ? JSON.parse(r) as T : null;
  }
  clearUser(): void { if (this.isBrowser) localStorage.removeItem(this.USER_KEY); }
  clear(): void { this.clearToken(); this.clearUser(); }
}
