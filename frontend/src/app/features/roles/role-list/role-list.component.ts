import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/role.model';
import { Pagination } from '../../../core/models/user.model';
import { PERMISSIONS } from '../../../core/constants/permissions.constant';
import {
  LoadingSpinnerComponent,
  ConfirmDialogComponent,
  ErrorBannerComponent,
} from '../../../shared';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    ErrorBannerComponent,
  ],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">Roles</h1>
          <p class="text-sm text-slate-500 mt-0.5">
            {{ roles().length }} roles in your organization
          </p>
        </div>
        @if (auth.hasPermission(PERMISSIONS.CREATE_ROLE)) {
          <button
            (click)="openCreate()"
            class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Role
          </button>
        }
      </div>

      @if (loadError()) {
        <app-error-banner [message]="loadError()" (dismiss)="loadError.set(null)" />
      }

      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
        @if (loading()) {
          <app-loading-spinner [padding]="48" />
        } @else if (roles().length === 0) {
          <div class="px-4 py-12 text-center text-sm text-slate-400">No roles found.</div>
        } @else {
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50">
                <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Role</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Description</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Permissions</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (role of roles(); track role.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2.5">
                      <div class="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 flex-shrink-0">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                      </div>
                      <span class="font-medium text-slate-800">{{ role.name }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-slate-500 max-w-xs">
                    <span class="truncate block">{{ role.description || '—' }}</span>
                  </td>
                  <td class="px-4 py-3">
                    @if ((role.permissions?.length ?? 0) > 0) {
                      <div class="flex flex-wrap gap-1 max-w-xs">
                        @for (p of (role.permissions ?? []).slice(0, 3); track p.id) {
                          <span class="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded font-medium whitespace-nowrap">{{ p.code }}</span>
                        }
                        @if ((role.permissions?.length ?? 0) > 3) {
                          <span class="text-xs text-slate-400 whitespace-nowrap">+{{ (role.permissions?.length ?? 0) - 3 }} more</span>
                        }
                      </div>
                    } @else {
                      <span class="text-xs text-slate-400">None assigned</span>
                    }
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="text-xs px-2 py-0.5 rounded-md font-medium"
                      [class]="role.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                    >
                      {{ role.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-3">
                      @if (auth.hasPermission(PERMISSIONS.UPDATE_ROLE)) {
                        <button (click)="openEdit(role)" class="text-xs text-slate-500 hover:text-slate-700 whitespace-nowrap">
                          Edit
                        </button>
                        <a [routerLink]="['/roles', role.id]" class="text-xs text-indigo-600 hover:underline whitespace-nowrap">
                          Manage Permissions
                        </a>
                      }
                      @if (auth.hasPermission(PERMISSIONS.DELETE_ROLE) && role.name !== 'ADMIN') {
                        @if (role.isActive) {
                          <button (click)="confirmDel(role)" class="text-xs text-red-400 hover:text-red-600">Delete</button>
                        } @else {
                          <button (click)="doRestore(role)" class="text-xs text-emerald-500 hover:text-emerald-700">Restore</button>
                        }
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Pagination -->
          @if ((pagination()?.totalPages ?? 0) > 1) {
            <div class="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <p class="text-xs text-slate-500">
                Page <span class="font-semibold text-slate-700">{{ pagination()?.page }}</span>
                of <span class="font-semibold text-slate-700">{{ pagination()?.totalPages }}</span>
                · <span class="font-semibold text-slate-700">{{ pagination()?.totalRecords }}</span> roles
              </p>
              <div class="flex items-center gap-2">
                <button (click)="changePage(-1)"
                  [disabled]="(pagination()?.page ?? 1) <= 1"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                  Previous
                </button>
                <div class="flex items-center gap-1">
                  @for (pg of getPageNumbers(); track pg) {
                    @if (pg === -1) {
                      <span class="px-1 text-slate-400 text-xs">…</span>
                    } @else {
                      <button (click)="goToPage(pg)"
                        class="w-8 h-8 text-xs font-semibold rounded-lg transition-colors"
                        [class]="pagination()?.page === pg ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'">
                        {{ pg }}
                      </button>
                    }
                  }
                </div>
                <button (click)="changePage(1)"
                  [disabled]="(pagination()?.page ?? 1) >= (pagination()?.totalPages ?? 1)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                  Next
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>

    <!-- Add Role modal -->
    @if (showCreate) {
      <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-xl overflow-hidden">

          <!-- Header -->
          <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <div>
                <h2 class="font-semibold text-slate-900 text-base">Create role</h2>
                <p class="text-xs text-slate-500 mt-0.5">Define a new role for your organization</p>
              </div>
            </div>
            <button
              type="button"
              (click)="closeCreate()"
              class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form [formGroup]="createForm" (ngSubmit)="createRole()">
            <div class="px-6 py-5 space-y-4">

              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1.5">
                  Role name <span class="text-red-500">*</span>
                </label>
                <input
                  formControlName="name"
                  placeholder="e.g. Billing Auditor"
                  autocomplete="off"
                  class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 transition-shadow"
                  [class.border-red-300]="createForm.get('name')?.invalid && createForm.get('name')?.touched"
                />
                @if (createForm.get('name')?.invalid && createForm.get('name')?.touched) {
                  <p class="text-xs text-red-500 mt-1.5">Role name is required.</p>
                }
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1.5">
                  Description
                  <span class="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  formControlName="description"
                  rows="3"
                  placeholder="What is this role responsible for?"
                  class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none placeholder:text-slate-400 transition-shadow"
                ></textarea>
              </div>

              <div class="bg-slate-50 rounded-lg px-3.5 py-3 flex gap-2.5">
                <svg class="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-xs text-slate-500 leading-relaxed">
                  Permissions aren't set here — once the role is created, use
                  <span class="font-medium text-slate-600">Manage Permissions</span> to assign access.
                </p>
              </div>

              @if (createError()) {
                <app-error-banner [message]="createError()" (dismiss)="createError.set(null)" />
              }
            </div>

            <div class="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                (click)="closeCreate()"
                class="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="creating()"
                class="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                @if (creating()) {
                  <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Creating…
                } @else {
                  Create role
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Edit Role modal -->
    @if (showEdit) {
      <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-xl overflow-hidden">

          <!-- Header -->
          <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </div>
              <div>
                <h2 class="font-semibold text-slate-900 text-base">Edit role</h2>
                <p class="text-xs text-slate-500 mt-0.5">Update name or description for "{{ editingRole?.name }}"</p>
              </div>
            </div>
            <button
              type="button"
              (click)="closeEdit()"
              class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form [formGroup]="editForm" (ngSubmit)="saveEdit()">
            <div class="px-6 py-5 space-y-4">

              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1.5">
                  Role name <span class="text-red-500">*</span>
                </label>
                <input
                  formControlName="name"
                  placeholder="e.g. Billing Auditor"
                  autocomplete="off"
                  class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 transition-shadow"
                  [class.border-red-300]="editForm.get('name')?.invalid && editForm.get('name')?.touched"
                />
                @if (editForm.get('name')?.invalid && editForm.get('name')?.touched) {
                  <p class="text-xs text-red-500 mt-1.5">Role name is required.</p>
                }
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1.5">
                  Description
                  <span class="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  formControlName="description"
                  rows="3"
                  placeholder="What is this role responsible for?"
                  class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none placeholder:text-slate-400 transition-shadow"
                ></textarea>
              </div>

              @if (editError()) {
                <app-error-banner [message]="editError()" (dismiss)="editError.set(null)" />
              }
            </div>

            <div class="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                (click)="closeEdit()"
                class="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="updating()"
                class="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                @if (updating()) {
                  <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Saving…
                } @else {
                  Save changes
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <app-confirm-dialog
      [open]="!!deletingRole"
      title="Delete role?"
      [message]="'Delete role &quot;' + (deletingRole?.name ?? '') + '&quot;?'"
      confirmLabel="Delete"
      [destructive]="true"
      (confirm)="doDelete()"
      (cancel)="deletingRole = null"
    />
  `,
})
export class RoleListComponent implements OnInit {
  readonly PERMISSIONS = PERMISSIONS;
  roles = signal<Role[]>([]);
  pagination = signal<Pagination | null>(null);
  page = 1;
  loading = signal(true);
  loadError = signal<string | null>(null);

  creating = signal(false);
  createError = signal<string | null>(null);
  showCreate = false;
  createForm: FormGroup;

  // Edit role state — separate from create, wired to RoleService.updateRole()
  updating = signal(false);
  editError = signal<string | null>(null);
  showEdit = false;
  editingRole: Role | null = null;
  editForm: FormGroup;

  deletingRole: Role | null = null;

  constructor(
    public auth: AuthService,
    private roleSvc: RoleService,
    private fb: FormBuilder,
  ) {
    this.createForm = this.fb.group({ name: ['', Validators.required], description: [''] });
    this.editForm = this.fb.group({ name: ['', Validators.required], description: [''] });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.loadError.set(null);
    this.roleSvc.getRoles({ page: this.page, limit: 10 }).subscribe({
      next: (r) => {
        // Guard against a non-array response shape so @for never throws
        // "newCollection[Symbol.iterator] is not a function".
        const list = Array.isArray(r?.data)
          ? r.data
          : Array.isArray((r?.data as any)?.roles)
            ? (r.data as any).roles
            : [];
        if (!Array.isArray(r?.data) && !Array.isArray((r?.data as any)?.roles)) {
          console.warn('RoleService.getRoles(): unexpected response shape', r);
        }
        this.roles.set(list);
        this.pagination.set((r?.data as any)?.pagination ?? null);
        this.loading.set(false);
      },
      error: (e: any) => {
        console.error('Failed to load roles', e);
        this.roles.set([]);
        this.loadError.set(e?.message ?? 'Failed to load roles. Please try again.');
        this.loading.set(false);
      },
    });
  }

  changePage(d: number) { this.page += d; this.load(); }
  goToPage(pg: number) { this.page = pg; this.load(); }
  getPageNumbers(): number[] {
    const total = this.pagination()?.totalPages ?? 1;
    const current = this.pagination()?.page ?? 1;
    const pages: number[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  }

  openCreate() {
    this.createError.set(null);
    this.createForm.reset();
    this.showCreate = true;
  }
  closeCreate() {
    this.showCreate = false;
    this.createForm.reset();
  }

  createRole() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.createForm.value,
      description: this.createForm.value.description ?? '',
    };

    this.creating.set(true);
    this.createError.set(null);

    this.roleSvc.createRole(payload).subscribe({
      next: () => {
        this.creating.set(false);
        this.showCreate = false;
        this.createForm.reset();
        this.load();
      },
      error: (e: any) => {
        this.createError.set(e?.message ?? 'Failed to create role. Please try again.');
        this.creating.set(false);
      },
    });
  }

  // --- Edit role ---
  openEdit(role: Role) {
    this.editingRole = role;
    this.editError.set(null);
    this.editForm.reset({
      name: role.name,
      description: role.description ?? '',
    });
    this.showEdit = true;
  }
  closeEdit() {
    this.showEdit = false;
    this.editingRole = null;
    this.editForm.reset();
  }
  saveEdit() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const role = this.editingRole;
    if (!role) return;

    const payload = {
      ...this.editForm.value,
      description: this.editForm.value.description ?? '',
    };

    this.updating.set(true);
    this.editError.set(null);

    this.roleSvc.updateRole(role.id, payload).subscribe({
      next: () => {
        this.updating.set(false);
        this.showEdit = false;
        this.editingRole = null;
        this.editForm.reset();
        this.load();
      },
      error: (e: any) => {
        console.error('Failed to update role', e);
        this.editError.set(e?.error?.message ?? e?.message ?? 'Failed to update role. Please try again.');
        this.updating.set(false);
      },
    });
  }

  confirmDel(r: Role) {
    this.deletingRole = r;
  }
  doDelete() {
    const r = this.deletingRole;
    if (!r) return;
    this.deletingRole = null;
    this.roleSvc.deleteRole(r.id).subscribe({
      next: () => this.load(),
      error: (e: any) => {
        console.error('Failed to delete role', e);
        this.loadError.set(e?.message ?? 'Failed to delete role.');
      },
    });
  }
  doRestore(r: Role) {
    this.roleSvc.restoreRole(r.id).subscribe({
      next: () => this.load(),
      error: (e: any) => {
        console.error('Failed to restore role', e);
        this.loadError.set(e?.message ?? 'Failed to restore role.');
      },
    });
  }
}