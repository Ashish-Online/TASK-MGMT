import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';
import { User, Pagination } from '../../../core/models/user.model';
import { Role } from '../../../core/models/role.model';
import { PERMISSIONS } from '../../../core/constants/permissions.constant';
import { SocketService } from '../../../core/services/socket.service';
import { ConfirmDialogComponent, ErrorBannerComponent } from '../../../shared';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, ConfirmDialogComponent, ErrorBannerComponent],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold text-gray-900">Users</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ pagination()?.totalRecords ?? 0 }} members in your workspace</p>
        </div>
        @if (auth.hasPermission(PERMISSIONS.CREATE_USER)) {
          <button (click)="showCreate = true"
            class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            New User
          </button>
        }
      </div>

      @if (loadError()) {
        <app-error-banner [message]="loadError()" (dismiss)="loadError.set(null)" />
      }

      <!-- Filters -->
      <div class="bg-white border border-gray-200 rounded-2xl p-4 mb-4 flex flex-wrap gap-3 shadow-sm">
        <div class="relative flex-1 min-w-48">
          <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search by name or email…"
            class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors"/>
        </div>
        <select [(ngModel)]="filterRoleId" (ngModelChange)="load()"
          class="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white">
          <option value="">All Roles</option>
          @for (r of roles(); track r.id) {
            <option [value]="r.id">{{ r.name }}</option>
          }
        </select>
        <select [(ngModel)]="filterActive" (ngModelChange)="load()"
          class="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white">
          <option value="true">Active</option>
          <option value="false">Inactive</option>
          <option value="">All</option>
        </select>
      </div>

      <!-- Table -->
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        @if (loading()) {
          <div class="divide-y divide-gray-100">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div class="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-3.5 bg-gray-200 rounded w-32"></div>
                  <div class="h-3 bg-gray-200 rounded w-48"></div>
                </div>
                <div class="h-5 bg-gray-200 rounded-lg w-16"></div>
                <div class="h-5 bg-gray-200 rounded-lg w-14"></div>
              </div>
            }
          </div>
        } @else if (users().length === 0) {
          <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-700">No users found</p>
            <p class="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        } @else {
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50/80">
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th class="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th class="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th class="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th class="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Login</th>
                <th class="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              @for (user of users(); track user.id) {
                <tr class="hover:bg-gray-50/80 transition-colors group">
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                        {{ (user.firstName[0] + (user.lastName?.[0] ?? '')).toUpperCase() }}
                      </div>
                      <span class="font-semibold text-gray-800">{{ user.firstName }} {{ user.lastName ?? '' }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3.5 text-gray-500 text-xs">{{ user.email }}</td>
                  <td class="px-4 py-3.5">
                    <span class="text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-lg font-semibold">
                      {{ user.role?.name ?? '—' }}
                    </span>
                  </td>
                  <td class="px-4 py-3.5">
                    @if (!user.isActive) {
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700">
                        <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Inactive
                      </span>
                    } @else if (isUserOnline(user.id)) {
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Online
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600">
                        <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        Offline
                      </span>
                    }
                  </td>
                  <td class="px-4 py-3.5 text-gray-500 text-xs">
                    {{ user.lastLoginAt ? (user.lastLoginAt | date: 'MMM d, y') : 'Never' }}
                  </td>
                  <td class="px-5 py-3.5">
                    <div class="flex items-center justify-end gap-3">
                      <a [routerLink]="['/users', user.id]" class="text-xs font-medium text-indigo-600 hover:text-indigo-800">View</a>
                      @if (auth.hasPermission(PERMISSIONS.DELETE_USER) && user.isActive) {
                        <button (click)="confirmDel(user)" class="text-xs font-medium text-red-500 hover:text-red-700">Deactivate</button>
                      }
                      @if (auth.hasPermission(PERMISSIONS.UPDATE_USER) && !user.isActive) {
                        <button (click)="restoreUser(user)" class="text-xs font-medium text-emerald-600 hover:text-emerald-800">Restore</button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Pagination -->
          @if ((pagination()?.totalPages ?? 0) > 1) {
            <div class="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <p class="text-xs text-gray-500">
                Page <span class="font-semibold text-gray-700">{{ pagination()?.page }}</span>
                of <span class="font-semibold text-gray-700">{{ pagination()?.totalPages }}</span>
                · <span class="font-semibold text-gray-700">{{ pagination()?.totalRecords }}</span> users
              </p>
              <div class="flex items-center gap-2">
                <button (click)="changePage(-1)"
                  [disabled]="(pagination()?.page ?? 1) <= 1"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                  Previous
                </button>
                <div class="flex items-center gap-1">
                  @for (pg of getPageNumbers(); track pg) {
                    @if (pg === -1) {
                      <span class="px-1 text-gray-400 text-xs">…</span>
                    } @else {
                      <button (click)="goToPage(pg)"
                        class="w-8 h-8 text-xs font-semibold rounded-lg transition-colors"
                        [class]="pagination()?.page === pg ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'">
                        {{ pg }}
                      </button>
                    }
                  }
                </div>
                <button (click)="changePage(1)"
                  [disabled]="(pagination()?.page ?? 1) >= (pagination()?.totalPages ?? 1)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
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

    <!-- Create User Modal -->
    @if (showCreate) {
      <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl overflow-hidden">
          <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
              </div>
              <div>
                <h2 class="font-bold text-gray-900">Add new user</h2>
                <p class="text-xs text-gray-500 mt-0.5">Create a workspace account for a team member</p>
              </div>
            </div>
            <button (click)="showCreate = false" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <form [formGroup]="createForm" (ngSubmit)="createUser()">
            <div class="px-6 py-5 space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">First Name <span class="text-red-500">*</span></label>
                  <input formControlName="firstName" placeholder="John"
                    class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">Last Name</label>
                  <input formControlName="lastName" placeholder="Smith"
                    class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">Email <span class="text-red-500">*</span></label>
                <input formControlName="email" type="email" placeholder="john@company.com"
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">Password <span class="text-red-500">*</span></label>
                <input formControlName="password" type="password" placeholder="Min. 6 characters"
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">Role <span class="text-red-500">*</span></label>
                <select formControlName="roleId"
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">Select a role</option>
                  @for (r of roles(); track r.id) {
                    @if (r.isActive) { <option [value]="r.id">{{ r.name }}</option> }
                  }
                </select>
              </div>
              <app-error-banner [message]="createError()" (dismiss)="createError.set(null)" />
            </div>
            <div class="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button type="button" (click)="showCreate = false"
                class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-white transition-colors">
                Cancel
              </button>
              <button type="submit" [disabled]="creating()"
                class="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors">
                @if (creating()) {
                  <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating…
                } @else {
                  Create user
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <app-confirm-dialog
      [open]="!!deletingUser"
      title="Deactivate user?"
      [message]="'Deactivate ' + (deletingUser?.firstName ?? '') + ' ' + (deletingUser?.lastName ?? '') + '? They must have no active tasks assigned.'"
      confirmLabel="Deactivate"
      [destructive]="true"
      (confirm)="doDelete()"
      (cancel)="deletingUser = null"
    />
  `,
})
export class UserListComponent implements OnInit {
  readonly PERMISSIONS = PERMISSIONS;
  users = signal<User[]>([]);
  roles = signal<Role[]>([]);
  pagination = signal<Pagination | null>(null);
  loading = signal(true);
  creating = signal(false);
  createError = signal<string | null>(null);
  loadError = signal<string | null>(null);
  search = '';
  filterRoleId = '';
  filterActive = 'true';
  page = 1;
  showCreate = false;
  deletingUser: User | null = null;
  createForm: FormGroup;
  onlineUsers = signal<number[]>([]);

  constructor(
    public auth: AuthService,
    private userSvc: UserService,
    private roleSvc: RoleService,
    private fb: FormBuilder,
    private socketSvc: SocketService,
  ) {
    this.createForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roleId: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.userSvc.getOnlineUsers().subscribe({
      next: (res: any) => this.onlineUsers.set(res.data.users || []),
      error: (err) => console.error('Failed to load online users', err),
    });
    this.socketSvc.onUserStatusChanged().subscribe(({ userId, status }) => {
      this.onlineUsers.update((current) => {
        if (status === 'online') return current.includes(userId) ? current : [...current, userId];
        return current.filter((id) => id !== userId);
      });
    });
    this.roleSvc.getRoles().subscribe({
      next: (r) => {
        const list = Array.isArray(r?.data) ? r.data : Array.isArray((r?.data as any)?.roles) ? (r.data as any).roles : [];
        this.roles.set(list);
      },
      error: (e) => console.error('Failed to load roles', e),
    });
    this.load();
  }

  load() {
    this.loading.set(true);
    this.loadError.set(null);
    const p: any = { page: this.page, limit: 10 };
    if (this.search) p.search = this.search;
    if (this.filterRoleId) p.roleId = Number(this.filterRoleId);
    if (this.filterActive !== '') p.isActive = this.filterActive === 'true';

    this.userSvc.getUsers(p).subscribe({
      next: (r) => {
        const list = Array.isArray((r?.data as any)?.users) ? (r.data as any).users : Array.isArray(r?.data) ? (r.data as any) : [];
        this.users.set(list);
        this.pagination.set((r?.data as any)?.pagination ?? null);
        this.loading.set(false);
      },
      error: (e: any) => {
        this.users.set([]);
        this.loadError.set(e?.message ?? 'Failed to load users.');
        this.loading.set(false);
      },
    });
  }

  onSearch() { this.page = 1; this.load(); }

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

  createUser() {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    this.creating.set(true);
    this.createError.set(null);
    const payload = { ...this.createForm.value, roleId: Number(this.createForm.value.roleId) };
    this.userSvc.createUser(payload).subscribe({
      next: () => { this.showCreate = false; this.creating.set(false); this.createForm.reset(); this.load(); },
      error: (e: Error) => { this.createError.set(e.message); this.creating.set(false); },
    });
  }

  confirmDel(u: User) { this.deletingUser = u; }
  doDelete() {
    const u = this.deletingUser; if (!u) return;
    this.deletingUser = null;
    this.userSvc.deleteUser(u.id).subscribe({ next: () => this.load() });
  }
  restoreUser(u: User) { this.userSvc.restoreUser(u.id).subscribe({ next: () => this.load() }); }
  isUserOnline(userId: number): boolean { return this.onlineUsers().includes(userId); }
}