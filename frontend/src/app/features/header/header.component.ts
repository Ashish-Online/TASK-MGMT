import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.model';
import { TimeAgoPipe } from '../../shared';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TimeAgoPipe],
  template: `
    <header class="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div class="h-14 px-4 sm:px-6 flex items-center justify-between gap-4">

        <a routerLink="/dashboard" class="flex items-center gap-2.5 flex-shrink-0">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">TF</div>
          <span class="hidden sm:block font-semibold text-slate-900 text-sm">TaskFlow</span>
        </a>

        <div class="flex-1 max-w-md hidden md:block">
          <div class="relative">
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Search tasks, users, roles…"
              class="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
          </div>
        </div>

        <div class="flex items-center gap-1.5 flex-shrink-0">

          <!-- Notification bell -->
          <div class="relative">
            <button (click)="toggleNotifications()"
              class="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label="Notifications">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.21 1.04-.59 1.41L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              @if (notifSvc.unreadCount() > 0) {
                <span class="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center leading-none">
                  {{ notifSvc.unreadCount() > 9 ? '9+' : notifSvc.unreadCount() }}
                </span>
              }
            </button>

            @if (showNotifications()) {
              <div class="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <h3 class="text-sm font-semibold text-slate-800">Notifications</h3>
                  @if (notifSvc.unreadCount() > 0) {
                    <button (click)="markAllRead()" class="text-xs text-indigo-600 hover:underline">Mark all read</button>
                  }
                </div>
                <div class="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  @if (loadingNotifs()) {
                    <div class="px-4 py-6 text-center text-xs text-slate-400">Loading…</div>
                  }
                  @for (n of notifications(); track n.id) {
                    <div class="px-4 py-3 hover:bg-slate-50 transition-colors flex gap-2.5 cursor-pointer"
                      [class.bg-indigo-50]="!n.isRead" (click)="markRead(n)">
                      <div class="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        [class]="n.isRead ? 'bg-transparent' : 'bg-indigo-500'"></div>
                      <div class="min-w-0 flex-1">
                        <p class="text-xs font-medium text-slate-800 truncate">{{ n.title }}</p>
                        <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">{{ n.message }}</p>
                        <p class="text-[11px] text-slate-400 mt-1">{{ n.created_at | timeAgo }}</p>
                      </div>
                    </div>
                  }
                  @if (!loadingNotifs() && notifications().length === 0) {
                    <div class="px-4 py-8 text-center text-xs text-slate-400">You're all caught up</div>
                  }
                </div>
                <a routerLink="/notifications" (click)="showNotifications.set(false)"
                  class="block text-center text-xs text-indigo-600 hover:underline py-2.5 border-t border-slate-100">
                  View all notifications
                </a>
              </div>
            }
          </div>

          <div class="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

          <!-- Avatar menu -->
          <div class="relative">
            <button (click)="toggleProfile()"
              class="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Account menu">
              <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-semibold flex-shrink-0">
                {{ initials() }}
              </div>
              <div class="hidden lg:block text-left leading-tight">
                <p class="text-xs font-medium text-slate-800">{{ auth.currentUser()?.firstName }} {{ auth.currentUser()?.lastName }}</p>
                <p class="text-[11px] text-slate-400">{{ auth.currentUser()?.role?.name ?? 'Member' }}</p>
              </div>
              <svg class="w-3.5 h-3.5 text-slate-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            @if (showProfile()) {
              <div class="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <div class="px-4 py-3 border-b border-slate-100">
                  <p class="text-sm font-medium text-slate-800 truncate">{{ auth.currentUser()?.firstName }} {{ auth.currentUser()?.lastName }}</p>
                  <p class="text-xs text-slate-400 truncate mt-0.5">{{ auth.currentUser()?.email }}</p>
                </div>
                <div class="py-1">
                  <a routerLink="/profile" (click)="showProfile.set(false)"
                    class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    Your profile
                  </a>
                  <a routerLink="/settings" (click)="showProfile.set(false)"
                    class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Settings
                  </a>
                </div>
                <div class="py-1 border-t border-slate-100">
                  <button (click)="logout()"
                    class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    Log out
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent implements OnInit {
  notifications = signal<Notification[]>([]);
  loadingNotifs = signal(false);
  showNotifications = signal(false);
  showProfile = signal(false);

  constructor(
    public auth: AuthService,
    public notifSvc: NotificationService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.notifSvc.getUnreadCount().subscribe();
  }

  initials() {
    const u = this.auth.currentUser();
    if (!u) return '?';
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase() || '?';
  }

  toggleNotifications() {
    const opening = !this.showNotifications();
    this.showNotifications.set(opening);
    this.showProfile.set(false);
    if (opening && this.notifications().length === 0) {
      this.loadNotifications();
    }
  }

  loadNotifications() {
    this.loadingNotifs.set(true);
    this.notifSvc.getNotifications(1, 10).subscribe({
      next: (r) => {
        this.notifications.set(r.data.notifications);
        this.loadingNotifs.set(false);
      },
      error: () => this.loadingNotifs.set(false),
    });
  }

  markRead(n: Notification) {
    if (n.isRead) return;
    this.notifSvc.markAsRead(n.id).subscribe({
      next: (r) => {
        this.notifications.update(l => l.map(x => x.id === r.data.id ? { ...x, isRead: true } : x));
        this.notifSvc.unreadCount.update(c => Math.max(0, c - 1));
      },
    });
  }

  markAllRead() {
    this.notifSvc.markAllAsRead().subscribe({
      next: () => this.notifications.update(l => l.map(n => ({ ...n, isRead: true }))),
    });
  }

  toggleProfile() {
    this.showProfile.update(v => !v);
    if (this.showProfile()) this.showNotifications.set(false);
  }

  logout() {
    this.showProfile.set(false);
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('app-header')) {
      this.showNotifications.set(false);
      this.showProfile.set(false);
    }
  }
}