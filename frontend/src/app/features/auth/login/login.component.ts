import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4"
          >
            <span class="text-white text-xl">◆</span>
          </div>
          <h1 class="text-2xl font-semibold text-slate-900">WorkFlow</h1>
          <p class="text-slate-500 text-sm mt-1">Sign in to your workspace</p>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                formControlName="email"
                type="email"
                placeholder="you@company.com"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                [class.border-red-300]="isInvalid('email')"
              />
              @if (isInvalid('email')) {
                <p class="text-red-500 text-xs mt-1">Valid email required</p>
              }
            </div>
            <div class="mb-5">
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                formControlName="password"
                type="password"
                placeholder="••••••••"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                [class.border-red-300]="isInvalid('password')"
              />
              @if (isInvalid('password')) {
                <p class="text-red-500 text-xs mt-1">Password required</p>
              }
            </div>
            @if (error()) {
              <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {{ error() }}
              </div>
            }
            <button
              type="submit"
              [disabled]="loading()"
              class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              @if (loading()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              }
              Sign in
            </button>
          </form>
        </div>
        <p class="text-center text-sm text-slate-500 mt-6">
          New organization?
          <a routerLink="/register" class="text-indigo-600 hover:underline font-medium"
            >Register here</a
          >
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }
  isInvalid(f: string) {
    const c = this.form.get(f);
    return !!(c?.invalid && c?.touched);
  }
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e: Error) => {
        this.error.set(e.message);
        this.loading.set(false);
      },
    });
  }
}
