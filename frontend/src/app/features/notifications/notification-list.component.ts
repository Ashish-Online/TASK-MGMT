import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { Notification, NotificationType } from '../../core/models/notification.model';
import { Pagination } from '../../core/models/user.model';
import { LoadingSpinnerComponent, EmptyStateComponent, TimeAgoPipe } from '../../shared';

@Component({
  selector: 'app-notification-list', standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent, TimeAgoPipe],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <div><h1 class="text-xl font-semibold text-slate-900">Notifications</h1><p class="text-sm text-slate-500 mt-0.5">{{ notifSvc.unreadCount() }} unread</p></div>
        @if (notifSvc.unreadCount() > 0) {
          <button (click)="markAllRead()" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">Mark all as read</button>
        }
      </div> 
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
        @if (loading()) { <app-loading-spinner [padding]="48"/> }
        @else if (notifications().length === 0) { <app-empty-state icon="notifications" title="No notifications yet"/> }
        @else {
          <div class="divide-y divide-slate-100">
            @for (n of notifications(); track n.id) {
              <div class="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                   [class.bg-indigo-50]="!n.isRead" (click)="markRead(n)">
                <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm" [class]="iconBg(n.type)">
                  {{ icon(n.type) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-800">{{ n.title }}</p>
                  <p class="text-xs text-slate-500 mt-0.5">{{ n.message }}</p>
                  <p class="text-xs text-slate-400 mt-1">{{ n.created_at | timeAgo }} · {{ n.type }}</p>
                </div>
                @if (!n.isRead) { <div class="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5"></div> }
              </div>
            }
          </div>
          
          <!-- Pagination -->
          @if ((pagination()?.totalPages ?? 0) > 1) {
            <div class="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <p class="text-xs text-slate-500">
                Page <span class="font-semibold text-slate-700">{{ pagination()?.page }}</span>
                of <span class="font-semibold text-slate-700">{{ pagination()?.totalPages }}</span>
                · <span class="font-semibold text-slate-700">{{ pagination()?.totalRecords }}</span> notifications
              </p>
              <div class="flex items-center gap-2">
                <button (click)="changePage(-1)"
                  [disabled]="(pagination()?.page ?? 1) <= 1"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm bg-white">
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
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm bg-white">
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
  `,
})
export class NotificationListComponent implements OnInit {
  notifications = signal<Notification[]>([]); loading = signal(true); pagination = signal<Pagination | null>(null);
  private page = 1;
  constructor(public notifSvc: NotificationService) {}
  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.notifSvc.getNotifications(this.page, 10).subscribe({
      next: r => {
        this.notifications.set(r.data.notifications);
        this.pagination.set(r.data.pagination);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
  markRead(n: Notification) {
    if (n.isRead) return;
    this.notifSvc.markAsRead(n.id).subscribe({ next: r => {
      this.notifications.update(l => l.map(x => x.id===r.data.id ? {...x, isRead:true} : x));
      this.notifSvc.unreadCount.update(c => Math.max(0, c-1));
    }});
  }
  markAllRead() {
    this.notifSvc.markAllAsRead().subscribe({ next: () => this.notifications.update(l => l.map(n => ({...n, isRead:true}))) });
  }
  icon(t: NotificationType): string {
    const m: Record<NotificationType,string> = {
      TASK_ASSIGNED:'📋', TASK_REASSIGNED:'🔄', TASK_UNASSIGNED:'↩️',
      TASK_REVIEW_ASSIGNED:'👁️', TASK_READY_FOR_REVIEW:'🔍',
      TASK_APPROVED:'✅', TASK_REJECTED:'❌',
      TASK_DELETED:'🗑️', TASK_RESTORED:'♻️',
      TASK_COMMENT:'💬', COMMENT_UPDATED:'✏️', COMMENT_DELETED:'🗑️',
      TASK_DUE_REMINDER:'⏰', TASK_REMINDER:'🔔',
    };
    return m[t] ?? '📢';
  }
  iconBg(t: NotificationType): string {
    if (['TASK_APPROVED','TASK_RESTORED'].includes(t))            return 'bg-emerald-100';
    if (['TASK_REJECTED','TASK_DELETED','COMMENT_DELETED'].includes(t)) return 'bg-red-100';
    if (['TASK_ASSIGNED','TASK_REASSIGNED','TASK_REVIEW_ASSIGNED'].includes(t)) return 'bg-indigo-100';
    if (['TASK_DUE_REMINDER','TASK_REMINDER'].includes(t))        return 'bg-amber-100';
    return 'bg-slate-100';
  }
}
