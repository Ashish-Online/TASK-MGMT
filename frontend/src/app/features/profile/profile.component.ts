import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ErrorBannerComponent } from '../../shared';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ErrorBannerComponent],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-semibold">
          {{ initials() }}
        </div>
        <div>
          <h1 class="text-xl font-semibold text-slate-900">
            {{ auth.currentUser()?.firstName }} {{ auth.currentUser()?.lastName ?? '' }}
          </h1>
          <p class="text-sm text-slate-500">{{ auth.currentUser()?.email }}</p>
          <span class="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-md font-medium mt-1 inline-block">
            {{ auth.currentUser()?.role?.name ?? '—' }}
          </span>
        </div>
      </div>

      <!-- Update Profile -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 mb-4">
        <h2 class="text-sm font-semibold text-slate-800 mb-4">Update Profile</h2>
        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1.5">First Name *</label>
              <input formControlName="firstName"
                class="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1.5">Last Name</label>
              <input formControlName="lastName"
                class="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-xs font-medium text-slate-600 mb-1.5">Email *</label>
            <input formControlName="email" type="email"
              class="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <app-error-banner [message]="profileError()" (dismiss)="profileError.set(null)" />
          @if (profileSuccess()) {
            <div class="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700">
              Profile updated successfully.
            </div>
          }
          <button type="submit" [disabled]="savingProfile()"
            class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors">
            {{ savingProfile() ? 'Saving…' : 'Save Changes' }}
          </button>
        </form>
      </div>

      <!-- Change Password -->
      <div class="bg-white border border-slate-200 rounded-xl p-5">
        <h2 class="text-sm font-semibold text-slate-800 mb-4">Change Password</h2>
        <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
          <div class="mb-4">
            <label class="block text-xs font-medium text-slate-600 mb-1.5">Current Password *</label>
            <input formControlName="currentPassword" type="password"
              class="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div class="mb-4">
            <label class="block text-xs font-medium text-slate-600 mb-1.5">New Password *</label>
            <input formControlName="newPassword" type="password"
              class="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div class="mb-4">
            <label class="block text-xs font-medium text-slate-600 mb-1.5">Confirm New Password *</label>
            <input formControlName="confirmPassword" type="password"
              class="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            @if (passwordForm.errors?.['mismatch'] && passwordForm.get('confirmPassword')?.touched) {
              <p class="text-xs text-red-500 mt-1">Passwords do not match.</p>
            }
          </div>
          <app-error-banner [message]="passwordError()" (dismiss)="passwordError.set(null)" />
          @if (passwordSuccess()) {
            <div class="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700">
              Password changed successfully.
            </div>
          }
          <button type="submit" [disabled]="savingPassword()"
            class="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-sm rounded-lg transition-colors">
            {{ savingPassword() ? 'Updating…' : 'Change Password' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;

  savingProfile = signal(false);
  profileError = signal<string | null>(null);
  profileSuccess = signal(false);

  savingPassword = signal(false);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal(false);

  initials() {
    const u = this.auth.currentUser();
    if (!u) return '?';
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase() || '?';
  }

  constructor(
    public auth: AuthService,
    private userSvc: UserService,
    private fb: FormBuilder,
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit() {
    const u = this.auth.currentUser();
    if (u) {
      this.profileForm.patchValue({
        firstName: u.firstName,
        lastName: u.lastName ?? '',
        email: u.email,
      });
    }
  }

  passwordMatchValidator(group: FormGroup) {
    const n = group.get('newPassword')?.value;
    const c = group.get('confirmPassword')?.value;
    return n === c ? null : { mismatch: true };
  }

  saveProfile() {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    const u = this.auth.currentUser();
    if (!u) return;

    this.savingProfile.set(true);
    this.profileError.set(null);
    this.profileSuccess.set(false);

    this.userSvc.updateUser(u.id, this.profileForm.value).subscribe({
      next: (r) => {
        // Update the currentUser signal in AuthService so header reflects changes
        const current = this.auth.currentUser();
        if (current) {
          (this.auth as any)._currentUser?.set({ ...current, ...r.data });
        }
        this.profileSuccess.set(true);
        this.savingProfile.set(false);
      },
      error: (e: any) => {
        this.profileError.set(e?.error?.message ?? e?.message ?? 'Failed to update profile');
        this.savingProfile.set(false);
      },
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }

    this.savingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(false);

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.userSvc.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.passwordSuccess.set(true);
        this.passwordForm.reset();
        this.savingPassword.set(false);
      },
      error: (e: any) => {
        this.passwordError.set(e?.error?.message ?? e?.message ?? 'Failed to change password');
        this.savingPassword.set(false);
      },
    });
  }
}