import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { PERMISSIONS } from '../../core/constants/permissions.constant';
import {
  DashboardOverview,
  RecentTask,
  ActivityItem,
  ProductivityData,
  TeamPerformance,
  PendingReviews,
  MonthlyTrend,
} from '../../core/models/dashboard.model';
import { BadgeComponent, TimeAgoPipe } from '../../shared';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent, TimeAgoPipe, HeaderComponent],
  template: `
    <app-header />

    <!-- Dynamic loading overlay — only shown when server is loading -->
    @if (loading()) {
      <div class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div class="relative">
          <div class="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
        </div>
        <div class="text-center">
          <p class="text-sm font-medium text-gray-700">Loading dashboard</p>
          <p class="text-xs text-gray-400 mt-1">Fetching your workspace data…</p>
        </div>
      </div>
    } @else if (error()) {
      <div class="p-6">
        <div class="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-red-800">Failed to load dashboard</p>
            <p class="text-sm text-red-600 mt-1">{{ error() }}</p>
            <button (click)="ngOnInit()" class="mt-3 text-xs font-medium text-red-700 hover:text-red-900 underline">Try again</button>
          </div>
        </div>
      </div>
    } @else {
      <div class="p-6 max-w-screen-xl mx-auto">

        <!-- Page header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Good {{ greeting() }}, {{ auth.currentUser()?.firstName || 'there' }} 👋
            </h1>
            <p class="text-sm text-gray-500 mt-1">Here's what's happening in your workspace today.</p>
          </div>
          @if (auth.hasPermission(PERMISSIONS.VIEW_AUDIT_LOG)) {
            <button (click)="exportReport()"
              class="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Export Report
            </button>
          }
        </div>

        @if (overview(); as ov) {
          <!-- Task Status Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-3">
                <div class="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                  <svg class="w-4.5 h-4.5 w-[18px] h-[18px] text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ ov.totalTasks }}</p>
              <p class="text-xs text-gray-500 mt-1 font-medium">Total Tasks</p>
            </div>

            <div class="bg-blue-50 rounded-2xl border border-blue-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-3">
                <div class="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                  <svg class="w-[18px] h-[18px] text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <p class="text-3xl font-bold text-blue-700">{{ ov.inProgressTasks }}</p>
              <p class="text-xs text-blue-600 mt-1 font-medium">In Progress</p>
            </div>

            <div class="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <svg class="w-[18px] h-[18px] text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <p class="text-3xl font-bold text-emerald-700">{{ ov.completedTasks }}</p>
              <p class="text-xs text-emerald-600 mt-1 font-medium">Completed</p>
            </div>

            <div class="bg-amber-50 rounded-2xl border border-amber-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-3">
                <div class="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                  <svg class="w-[18px] h-[18px] text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </div>
              </div>
              <p class="text-3xl font-bold text-amber-700">{{ ov.pendingReviewTasks }}</p>
              <p class="text-xs text-amber-600 mt-1 font-medium">Pending Review</p>
            </div>

            <div class="bg-red-50 rounded-2xl border border-red-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-3">
                <div class="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                  <svg class="w-[18px] h-[18px] text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <p class="text-3xl font-bold text-red-600">{{ ov.rejectedTasks }}</p>
              <p class="text-xs text-red-500 mt-1 font-medium">Rejected</p>
            </div>
          </div>

          <!-- System Quick Links -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <a routerLink="/users" class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-2xl font-bold text-indigo-600">{{ ov.totalUsers }}</p>
                  <p class="text-xs text-gray-500 font-medium">Users</p>
                </div>
              </div>
            </a>
            <a routerLink="/roles" class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:border-violet-200 hover:shadow-md transition-all group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                  <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-2xl font-bold text-violet-600">{{ ov.totalRoles }}</p>
                  <p class="text-xs text-gray-500 font-medium">Roles</p>
                </div>
              </div>
            </a>
            <a routerLink="/roles" class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:border-teal-200 hover:shadow-md transition-all group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                  <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-2xl font-bold text-teal-600">{{ ov.totalPermissions }}</p>
                  <p class="text-xs text-gray-500 font-medium">Permissions</p>
                </div>
              </div>
            </a>
            <a routerLink="/notifications" class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:border-amber-200 hover:shadow-md transition-all group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                </div>
                <div>
                  <p class="text-2xl font-bold text-amber-600">{{ ov.unreadNotifications }}</p>
                  <p class="text-xs text-gray-500 font-medium">Unread Alerts</p>
                </div>
              </div>
            </a>
          </div>
        }

        <!-- Main grid -->
        <div class="grid grid-cols-12 gap-5 mb-5">

          <!-- Recent Tasks -->
          <div class="col-span-12 lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 class="text-sm font-semibold text-gray-900">Recent Tasks</h2>
                <p class="text-xs text-gray-400 mt-0.5">Latest activity across your workspace</p>
              </div>
              <a routerLink="/tasks" class="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                View all
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
            <div class="divide-y divide-gray-50">
              @for (task of recentTasks(); track task.id) {
                <a [routerLink]="['/tasks', task.id]"
                  class="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                  <app-badge type="status" [value]="task.status" />
                  <span class="text-sm text-gray-800 flex-1 truncate group-hover:text-indigo-600 transition-colors font-medium">{{ task.title }}</span>
                  <span class="text-xs text-gray-400 flex-shrink-0">
                    {{ task.dueDate ? (task.dueDate | date: 'MMM d') : '' }}
                  </span>
                  <svg class="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
              }
              @if (recentTasks().length === 0) {
                <div class="px-5 py-12 text-center">
                  <svg class="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <p class="text-sm text-gray-400">No tasks yet</p>
                </div>
              }
            </div>
          </div>

          <!-- Right column -->
          <div class="col-span-12 lg:col-span-5 space-y-5">

            <!-- Productivity -->
            @if (productivity(); as prod) {
              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-sm font-semibold text-gray-900">Your Productivity</h2>
                  <span class="text-2xl font-bold"
                    [class]="prod.productivityPercentage >= 70 ? 'text-emerald-600' : prod.productivityPercentage >= 40 ? 'text-amber-600' : 'text-red-500'">
                    {{ prod.productivityPercentage | number: '1.0-0' }}%
                  </span>
                </div>
                <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div class="h-full rounded-full transition-all duration-700"
                    [style.width.%]="prod.productivityPercentage"
                    [class]="prod.productivityPercentage >= 70 ? 'bg-emerald-500' : prod.productivityPercentage >= 40 ? 'bg-amber-500' : 'bg-red-500'">
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <div class="text-center py-3 bg-gray-50 rounded-xl">
                    <p class="text-xl font-bold text-gray-800">{{ prod.totalTasks }}</p>
                    <p class="text-xs text-gray-500 mt-0.5">Total</p>
                  </div>
                  <div class="text-center py-3 bg-emerald-50 rounded-xl">
                    <p class="text-xl font-bold text-emerald-700">{{ prod.completedTasks }}</p>
                    <p class="text-xs text-emerald-600 mt-0.5">Done</p>
                  </div>
                  <div class="text-center py-3 bg-red-50 rounded-xl">
                    <p class="text-xl font-bold text-red-600">{{ prod.overdueTasks }}</p>
                    <p class="text-xs text-red-500 mt-0.5">Overdue</p>
                  </div>
                </div>
              </div>
            }

            <!-- Pending Reviews -->
            @if ((pendingReviews()?.count ?? 0) > 0) {
              <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                      <svg class="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <h2 class="text-sm font-semibold text-amber-900">Pending Reviews</h2>
                  </div>
                  <a routerLink="/review-queue"
                    class="text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg transition-colors">
                    Review {{ pendingReviews()?.count }} →
                  </a>
                </div>
                @for (t of (pendingReviews()?.tasks ?? []).slice(0, 3); track t.id) {
                  <div class="flex items-center gap-2 py-1.5">
                    <div class="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0"></div>
                    <p class="text-xs text-amber-800 truncate">{{ t.title }}</p>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Bottom row: Status distribution + Team + Activity -->
        <div class="grid grid-cols-12 gap-5 mb-5">

          <!-- Status Distribution -->
          <div class="col-span-12 md:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 class="text-sm font-semibold text-gray-900 mb-5">Status Distribution</h2>
            @for (item of statusChartItems(); track item.label) {
              <div class="mb-4 last:mb-0">
                <div class="flex justify-between items-center text-xs mb-1.5">
                  <span class="font-medium text-gray-700">{{ item.label }}</span>
                  <span class="text-gray-500 font-mono">{{ item.value }} · {{ item.pct }}%</span>
                </div>
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700" [style.width.%]="item.pct" [class]="item.color"></div>
                </div>
              </div>
            }
          </div>

          <!-- Team Performance -->
          @if (auth.hasPermission(PERMISSIONS.VIEW_ALL_TASKS)) {
            <div class="col-span-12 md:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-100">
                <h2 class="text-sm font-semibold text-gray-900">Team Performance</h2>
                <p class="text-xs text-gray-400 mt-0.5">Productivity by member</p>
              </div>
              <div class="divide-y divide-gray-50 px-2">
                @for (m of teamPerformance().slice(0, 5); track m.userId) {
                  <div class="flex items-center gap-3 px-3 py-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                      {{ m.firstName[0] }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-semibold text-gray-800 truncate">{{ m.firstName }} {{ m.lastName ?? '' }}</p>
                      <div class="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                        <div class="h-full bg-indigo-500 rounded-full transition-all duration-700" [style.width.%]="m.productivityPercentage"></div>
                      </div>
                    </div>
                    <span class="text-xs font-bold text-gray-600 flex-shrink-0 w-10 text-right">
                      {{ m.productivityPercentage | number: '1.0-0' }}%
                    </span>
                  </div>
                }
                @if (teamPerformance().length === 0) {
                  <div class="px-5 py-8 text-center text-xs text-gray-400">No data available</div>
                }
              </div>
            </div>
          }

          <!-- Recent Activity -->
          @if (auth.hasPermission(PERMISSIONS.VIEW_AUDIT_LOG)) {
            <div class="col-span-12 md:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-100">
                <h2 class="text-sm font-semibold text-gray-900">Recent Activity</h2>
                <p class="text-xs text-gray-400 mt-0.5">Latest audit events</p>
              </div>
              <div class="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                @for (act of recentActivities(); track act.id) {
                  <div class="flex items-start gap-3 px-5 py-3">
                    <div class="w-2 h-2 rounded-full bg-indigo-400 mt-2 flex-shrink-0"></div>
                    <div class="min-w-0">
                      <p class="text-xs text-gray-700 leading-relaxed">{{ act.description }}</p>
                      <p class="text-[11px] text-gray-400 mt-0.5">
                        {{ act.user?.firstName || 'System' }} · {{ act.created_at | timeAgo }}
                      </p>
                    </div>
                  </div>
                }
                @if (recentActivities().length === 0) {
                  <div class="px-5 py-8 text-center text-xs text-gray-400">No activity logged yet</div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Last row: Top Performers, Monthly Trend, Priority -->
        <div class="grid grid-cols-12 gap-5">

          <!-- Top Performers -->
          <div class="col-span-12 md:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100">
              <h2 class="text-sm font-semibold text-gray-900">Top Performers</h2>
            </div>
            <div class="divide-y divide-gray-50">
              @for (user of topPerformers(); track user.userId; let i = $index) {
                <div class="flex items-center gap-3 px-5 py-3.5">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    [class]="i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'">
                    {{ i + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-800 truncate">{{ user.name }}</p>
                    <p class="text-xs text-gray-400">{{ user.completedTasks }} tasks completed</p>
                  </div>
                  <span class="text-sm font-bold text-emerald-600">{{ user.productivity }}%</span>
                </div>
              }
              @if (topPerformers().length === 0) {
                <div class="px-5 py-8 text-center text-xs text-gray-400">No data yet</div>
              }
            </div>
          </div>

          <!-- Monthly Trend -->
          <div class="col-span-12 md:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 class="text-sm font-semibold text-gray-900 mb-5">Monthly Trend</h2>
            <div class="space-y-3">
              @for (item of monthlyTrend(); track $index) {
                <div class="flex items-center gap-3">
                  <span class="text-xs text-gray-500 w-10 flex-shrink-0 font-medium">{{ item.month }}</span>
                  <div class="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-indigo-500 rounded-full transition-all duration-700"
                      [style.width.%]="item.count ? (item.count / Math.max(...monthlyTrend().map(m => m.count), 1)) * 100 : 0">
                    </div>
                  </div>
                  <span class="text-xs text-gray-600 font-semibold w-6 text-right flex-shrink-0">{{ item.count }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Task Priority -->
          <div class="col-span-12 md:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 class="text-sm font-semibold text-gray-900 mb-5">Task Priority</h2>
            @if (priorityChart(); as p) {
              <div class="space-y-3">
                @for (item of priorityItems(p); track item.label) {
                  <div class="flex items-center gap-3">
                    <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" [class]="item.dot"></div>
                    <span class="text-xs font-semibold flex-shrink-0 w-16" [class]="item.color">{{ item.label }}</span>
                    <div class="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-700" [class]="item.bar"
                        [style.width.%]="item.total > 0 ? (item.count / item.total) * 100 : 0">
                      </div>
                    </div>
                    <span class="text-xs font-bold text-gray-700 w-6 text-right flex-shrink-0">{{ item.count }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>

      </div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  readonly PERMISSIONS = PERMISSIONS;
  readonly Math = Math;

  overview = signal<DashboardOverview | null>(null);
  recentTasks = signal<RecentTask[]>([]);
  recentActivities = signal<ActivityItem[]>([]);
  productivity = signal<ProductivityData | null>(null);
  teamPerformance = signal<TeamPerformance[]>([]);
  pendingReviews = signal<PendingReviews | null>(null);
  statusChartItems = signal<{ label: string; value: number; pct: number; color: string }[]>([]);
  topPerformers = signal<any[]>([]);
  monthlyTrend = signal<MonthlyTrend[]>([]);
  priorityChart = signal<{ LOW: number; MEDIUM: number; HIGH: number; CRITICAL: number } | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    public auth: AuthService,
    private dash: DashboardService,
  ) {}

  greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  priorityItems(p: { LOW: number; MEDIUM: number; HIGH: number; CRITICAL: number }) {
    const total = (p.LOW ?? 0) + (p.MEDIUM ?? 0) + (p.HIGH ?? 0) + (p.CRITICAL ?? 0) || 1;
    return [
      { label: 'LOW', count: p.LOW ?? 0, total, dot: 'bg-slate-400', color: 'text-slate-500', bar: 'bg-slate-400' },
      { label: 'MEDIUM', count: p.MEDIUM ?? 0, total, dot: 'bg-amber-400', color: 'text-amber-600', bar: 'bg-amber-400' },
      { label: 'HIGH', count: p.HIGH ?? 0, total, dot: 'bg-orange-500', color: 'text-orange-600', bar: 'bg-orange-500' },
      { label: 'CRITICAL', count: p.CRITICAL ?? 0, total, dot: 'bg-red-500', color: 'text-red-600', bar: 'bg-red-500' },
    ];
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      ov: this.dash.getOverview(),
      rt: this.dash.getRecentTasks(),
      sc: this.dash.getTaskStatusChart(),
      pr: this.dash.getProductivity(),
      pend: this.dash.getPendingReviews(),
      tp: this.dash.getTopPerformers(),
      mt: this.dash.getMonthlyTrend(),
      pc: this.dash.getTaskPriorityChart(),
    }).subscribe({
      next: (r) => {
        this.overview.set(r.ov.data);
        this.recentTasks.set(r.rt.data);
        this.productivity.set(r.pr.data);
        this.pendingReviews.set(r.pend.data);
        this.topPerformers.set(r.tp.data);
        this.monthlyTrend.set(r.mt.data ?? []);
        this.priorityChart.set(r.pc.data);

        const sc = r.sc.data;
        const total = (sc.TODO ?? 0) + (sc.IN_PROGRESS ?? 0) + (sc.COMPLETED ?? 0) +
          (sc.APPROVED ?? 0) + (sc.REJECTED ?? 0) || 1;

        this.statusChartItems.set([
          { label: 'Todo', value: sc.TODO ?? 0, pct: Math.round(((sc.TODO ?? 0) / total) * 100), color: 'bg-gray-400' },
          { label: 'In Progress', value: sc.IN_PROGRESS ?? 0, pct: Math.round(((sc.IN_PROGRESS ?? 0) / total) * 100), color: 'bg-blue-500' },
          { label: 'Completed', value: sc.COMPLETED ?? 0, pct: Math.round(((sc.COMPLETED ?? 0) / total) * 100), color: 'bg-emerald-500' },
          { label: 'Approved', value: sc.APPROVED ?? 0, pct: Math.round(((sc.APPROVED ?? 0) / total) * 100), color: 'bg-green-600' },
          { label: 'Rejected', value: sc.REJECTED ?? 0, pct: Math.round(((sc.REJECTED ?? 0) / total) * 100), color: 'bg-red-500' },
        ]);

        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load dashboard');
        this.loading.set(false);
      },
    });

    if (this.auth.hasPermission(PERMISSIONS.VIEW_AUDIT_LOG)) {
      this.dash.getRecentActivities().subscribe({
        next: (r) => this.recentActivities.set(r.data),
        error: (err) => console.error(err),
      });
    }

    if (this.auth.hasPermission(PERMISSIONS.VIEW_ALL_TASKS)) {
      this.dash.getTeamPerformance().subscribe({
        next: (r) => this.teamPerformance.set(r.data),
        error: (err) => console.error(err),
      });
    }
  }

  exportReport() {
    this.dash.exportReport();
  }
}