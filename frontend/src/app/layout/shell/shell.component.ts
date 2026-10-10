import { Component, OnInit, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { SocketService } from '../../core/services/socket.service';
import { PERMISSIONS } from '../../core/constants/permissions.constant';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">

      <!-- Sidebar -->
      <aside class="w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 shadow-sm">

        <!-- Logo -->
        <div class="h-16 flex items-center px-5 border-b border-gray-100">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-bold text-gray-900 leading-none">WorkFlow</p>
              <p class="text-[10px] text-gray-400 mt-0.5 leading-none">Task Management</p>
            </div>
          </div>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">

          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">Main</p>

          <a routerLink="/dashboard" routerLinkActive="bg-indigo-50 text-indigo-700 font-medium" [routerLinkActiveOptions]="{exact:true}"
             class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all text-sm">
            <svg class="w-4.5 h-4.5 w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
            </svg>
            <span>Dashboard</span>
          </a>

          <a routerLink="/my-tasks" routerLinkActive="bg-indigo-50 text-indigo-700 font-medium"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all text-sm">
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span>My Tasks</span>
          </a>

          @if (auth.hasPermission(PERMISSIONS.VIEW_TASKS)) {
            <a routerLink="/tasks" routerLinkActive="bg-indigo-50 text-indigo-700 font-medium"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all text-sm">
              <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
              <span>All Tasks</span>
            </a>
          }

          @if (auth.hasPermission(PERMISSIONS.APPROVE_TASK)) {
            <a routerLink="/review-queue" routerLinkActive="bg-indigo-50 text-indigo-700 font-medium"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all text-sm">
              <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Review Queue</span>
            </a>
          }

          @if (auth.hasPermission(PERMISSIONS.NOTIFICATION_VIEW)) {
            <a routerLink="/notifications" routerLinkActive="bg-indigo-50 text-indigo-700 font-medium"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all text-sm">
              <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span>Notifications</span>
              @if (notifService.unreadCount() > 0) {
                <span class="ml-auto bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {{ notifService.unreadCount() > 99 ? '99+' : notifService.unreadCount() }}
                </span>
              }
            </a>
          }

          @if (auth.hasPermission(PERMISSIONS.VIEW_USERS) || auth.hasPermission(PERMISSIONS.VIEW_ROLES)) {
            <div class="pt-3 pb-1">
              <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">Admin</p>
            </div>
          }

          @if (auth.hasPermission(PERMISSIONS.VIEW_USERS)) {
            <a routerLink="/users" routerLinkActive="bg-indigo-50 text-indigo-700 font-medium"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all text-sm">
              <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span>Users</span>
            </a>
          }

          @if (auth.hasPermission(PERMISSIONS.VIEW_ROLES)) {
            <a routerLink="/roles" routerLinkActive="bg-indigo-50 text-indigo-700 font-medium"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all text-sm">
              <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <span>Roles</span>
            </a>
          }
        </nav>

        <!-- User footer -->
        <div class="border-t border-gray-100 p-3">
          <div class="flex items-center gap-3 px-2 py-1.5">
            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
              {{ initials() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate leading-tight">{{ fullName() }}</p>
              <p class="text-xs text-gray-400 truncate leading-tight">{{ auth.currentUser()?.role?.name }}</p>
            </div>
            <button (click)="auth.logout()" title="Sign out"
              class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto min-w-0">
        <router-outlet/>
      </main>
    </div>
  `,
})
export class ShellComponent implements OnInit {
  readonly PERMISSIONS = PERMISSIONS;
  readonly initials = computed(() => {
    const u = this.auth.currentUser();
    return u ? (u.firstName[0] + (u.lastName?.[0] ?? '')).toUpperCase() : '?';
  });
  readonly fullName = computed(() => {
    const u = this.auth.currentUser();
    return u ? `${u.firstName} ${u.lastName ?? ''}`.trim() : '';
  });

  constructor(
    public auth: AuthService,
    public notifService: NotificationService,
    private socket: SocketService,
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) return;
    this.socket.connect(user.id);
    this.notifService.getUnreadCount().subscribe();
    this.socket.onNotification().subscribe(() => this.notifService.getUnreadCount().subscribe());
  }
}