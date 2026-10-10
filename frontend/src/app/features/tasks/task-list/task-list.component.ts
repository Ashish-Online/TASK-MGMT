import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task, TaskFilters } from '../../../core/models/task.model';
import { Pagination } from '../../../core/models/user.model';
import { PERMISSIONS } from '../../../core/constants/permissions.constant';
import {
  BadgeComponent,
  ConfirmDialogComponent,
} from '../../../shared';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    BadgeComponent,
    ConfirmDialogComponent, TaskFormComponent,
  ],
  template: `
    <div class="p-6">
      <!-- Page header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold text-gray-900">Tasks</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ pagination()?.totalRecords ?? 0 }} tasks total</p>
        </div>
        @if (auth.hasPermission(PERMISSIONS.CREATE_TASK)) {
          <button (click)="showForm = true"
            class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Task
          </button>
        }
      </div>

      <!-- Filters -->
      <div class="bg-white border border-gray-200 rounded-2xl p-4 mb-4 flex flex-wrap gap-3 shadow-sm">
        <div class="relative flex-1 min-w-48">
          <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input [(ngModel)]="filters.search" (ngModelChange)="resetAndLoad()" placeholder="Search tasks…"
            class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"/>
        </div>
        <select [(ngModel)]="filters.status" (ngModelChange)="resetAndLoad()"
          class="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors">
          <option value="">All statuses</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select [(ngModel)]="filters.priority" (ngModelChange)="resetAndLoad()"
          class="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors">
          <option value="">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <select [(ngModel)]="isActiveFilter" (ngModelChange)="resetAndLoad()"
          class="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors">
          <option value="true">Active</option>
          <option value="false">Deleted</option>
          <option value="">All</option>
        </select>
      </div>

      <!-- Table -->
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        @if (loading()) {
          <!-- Dynamic loading: skeleton rows -->
          <div class="divide-y divide-gray-100">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-1/3"></div>
                <div class="h-5 bg-gray-200 rounded w-20"></div>
                <div class="h-5 bg-gray-200 rounded w-16 ml-2"></div>
                <div class="h-4 bg-gray-200 rounded w-24 ml-auto"></div>
              </div>
            }
          </div>
        } @else if (tasks().length === 0) {
          <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-700">No tasks found</p>
            <p class="text-xs text-gray-400 mt-1">Adjust your filters or create a new task</p>
            @if (auth.hasPermission(PERMISSIONS.CREATE_TASK)) {
              <button (click)="showForm = true"
                class="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Create your first task
              </button>
            }
          </div>
        } @else {
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50/80">
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                <th class="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th class="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                <th class="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assignee</th>
                <th class="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reviewer</th>
                <th class="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due</th>
                <th class="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              @for (task of tasks(); track task.id) {
                <tr class="hover:bg-gray-50/80 transition-colors group">
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-2">
                      @if (task.isDelayed) {
                        <span class="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" title="Overdue"></span>
                      }
                      <a [routerLink]="['/tasks', task.id]"
                        class="font-medium text-gray-800 hover:text-indigo-600 transition-colors truncate max-w-xs">
                        {{ task.title }}
                      </a>
                    </div>
                  </td>
                  <td class="px-4 py-3.5"><app-badge type="status" [value]="task.status" /></td>
                  <td class="px-4 py-3.5"><app-badge type="priority" [value]="task.priority" /></td>
                  <td class="px-4 py-3.5">
                    @if (task.assignee) {
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0">
                          {{ task.assignee.firstName[0] }}
                        </div>
                        <span class="text-xs text-gray-600 truncate">{{ task.assignee.firstName }} {{ task.assignee.lastName ?? '' }}</span>
                      </div>
                    } @else {
                      <span class="text-xs text-gray-400">—</span>
                    }
                  </td>
                  <td class="px-4 py-3.5">
                    <span class="text-xs text-gray-500">
                      {{ task.reviewer ? task.reviewer.firstName + ' ' + (task.reviewer.lastName ?? '') : '—' }}
                    </span>
                  </td>
                  <td class="px-4 py-3.5 text-xs" [class]="task.isDelayed ? 'text-red-600 font-semibold' : 'text-gray-500'">
                    {{ task.dueDate ? (task.dueDate | date: 'MMM d') : '—' }}
                  </td>
                  <td class="px-5 py-3.5">
                    <div class="flex items-center justify-end gap-3">
                      <a [routerLink]="['/tasks', task.id]" class="text-xs font-medium text-indigo-600 hover:text-indigo-800">View</a>
                      @if (auth.hasAnyPermission(PERMISSIONS.EDIT_OWN_TASK, PERMISSIONS.EDIT_ALL_TASKS)) {
                        <button (click)="editTask(task)" class="text-xs font-medium text-gray-500 hover:text-gray-800">Edit</button>
                      }
                      @if (auth.hasPermission(PERMISSIONS.DELETE_TASK) && task.isActive) {
                        <button (click)="confirmDelete(task)" class="text-xs font-medium text-red-500 hover:text-red-700">Delete</button>
                      }
                      @if (auth.hasPermission(PERMISSIONS.RESTORE_TASK) && !task.isActive) {
                        <button (click)="restoreTask(task)" class="text-xs font-medium text-emerald-600 hover:text-emerald-800">Restore</button>
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
                Showing page <span class="font-semibold text-gray-700">{{ pagination()?.page }}</span>
                of <span class="font-semibold text-gray-700">{{ pagination()?.totalPages }}</span>
                · <span class="font-semibold text-gray-700">{{ pagination()?.totalRecords }}</span> tasks
              </p>
              <div class="flex items-center gap-2">
                <button (click)="changePage(-1)"
                  [disabled]="(pagination()?.page ?? 1) <= 1"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-gray-300 transition-colors bg-white shadow-sm">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                  Previous
                </button>

                <!-- Page number buttons -->
                <div class="flex items-center gap-1">
                  @for (page of getPageNumbers(); track page) {
                    @if (page === -1) {
                      <span class="px-2 text-gray-400">…</span>
                    } @else {
                      <button (click)="goToPage(page)"
                        class="w-8 h-8 text-xs font-medium rounded-lg transition-colors"
                        [class]="pagination()?.page === page
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'">
                        {{ page }}
                      </button>
                    }
                  }
                </div>

                <button (click)="changePage(1)"
                  [disabled]="(pagination()?.page ?? 1) >= (pagination()?.totalPages ?? 1)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-gray-300 transition-colors bg-white shadow-sm">
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

    @if (showForm) {
      <app-task-form [task]="editingTask" (saved)="onSaved($event)" (cancel)="closeForm()" />
    }

    <app-confirm-dialog
      [open]="!!deletingTask"
      title="Delete task?"
      [message]="'Are you sure you want to delete &quot;' + (deletingTask?.title ?? '') + '&quot;? This action can be undone later.'"
      confirmLabel="Delete"
      [destructive]="true"
      (confirm)="doDelete()"
      (cancel)="deletingTask = null"
    />
  `,
})
export class TaskListComponent implements OnInit {
  readonly PERMISSIONS = PERMISSIONS;
  tasks = signal<Task[]>([]);
  pagination = signal<Pagination | null>(null);
  loading = signal(true);
  filters: TaskFilters = { page: 1, limit: 10 };
  isActiveFilter = 'true';
  showForm = false;
  editingTask: Task | null = null;
  deletingTask: Task | null = null;

  constructor(public auth: AuthService, private taskSvc: TaskService) { }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const p = { ...this.filters } as any;
    if (this.isActiveFilter !== '') p.isActive = this.isActiveFilter === 'true';
    this.taskSvc.getTasks(p).subscribe({
      next: (r) => {
        this.tasks.set(r.data.tasks);
        this.pagination.set(r.data.pagination);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  resetAndLoad() { this.filters.page = 1; this.load(); }

  changePage(d: number) {
    this.filters.page = (this.filters.page ?? 1) + d;
    this.load();
  }

  goToPage(page: number) {
    this.filters.page = page;
    this.load();
  }

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

  editTask(t: Task) { this.editingTask = t; this.showForm = true; }
  closeForm() { this.showForm = false; this.editingTask = null; }
  onSaved(_: Task) { this.closeForm(); this.load(); }
  confirmDelete(t: Task) { this.deletingTask = t; }
  doDelete() {
    const t = this.deletingTask;
    if (!t) return;
    this.deletingTask = null;
    this.taskSvc.deleteTask(t.id).subscribe({ next: () => this.load() });
  }
  restoreTask(t: Task) {
    this.taskSvc.restoreTask(t.id).subscribe({ next: () => this.load() });
  }
}