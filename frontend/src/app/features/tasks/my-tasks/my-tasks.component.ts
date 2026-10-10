import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { TaskCommentService } from '../../../core/services/task-comment.service';
import { TaskAttachmentService } from '../../../core/services/task-attachment.service';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { TaskComment } from '../../../core/models/task-comment.model';
import { TaskAttachment } from '../../../core/models/task-attachment.model';
import { BadgeComponent, LoadingSpinnerComponent, EmptyStateComponent } from '../../../shared';

type StatusFilter = '' | TaskStatus;

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-xl font-semibold text-slate-900">My Tasks</h1>
        <p class="text-sm text-slate-500 mt-0.5">
          {{ tasks().length }} task{{ tasks().length !== 1 ? 's' : '' }} assigned to you
        </p>
      </div>

      <div class="flex flex-wrap gap-2 mb-4">
        @for (f of statusFilters; track f.value) {
          <button
            (click)="setFilter(f.value)"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
            [class]="
              activeFilter() === f.value
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            "
          >
            {{ f.label }}
          </button>
        }
      </div>

      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
        @if (loading()) {
          <app-loading-spinner [padding]="48" label="Loading your tasks…" />
        } @else if (tasks().length === 0) {
          <app-empty-state
            icon="tasks"
            title="Nothing assigned"
            description="You have no tasks matching this filter"
          />
        } @else {
          <div class="divide-y divide-slate-100">
            @for (task of tasks(); track task.id) {
              <div class="p-4 hover:bg-slate-50 transition-colors">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <a
                      [routerLink]="['/tasks', task.id]"
                      class="font-medium text-slate-800 hover:text-indigo-600 transition-colors text-sm"
                    >
                      {{ task.title }}
                    </a>
                    <div class="flex items-center flex-wrap gap-2 mt-1.5">
                      <app-badge type="status" [value]="task.status" />
                      <app-badge type="priority" [value]="task.priority" />
                      @if (task.dueDate) {
                        <span class="text-xs" [class]="task.isDelayed ? 'text-red-500' : 'text-slate-400'">
                          Due {{ task.dueDate | date: 'MMM d' }} {{ task.isDelayed ? '· ⚠ overdue' : '' }}
                        </span>
                      }
                      @if ((commentCounts().get(task.id) ?? 0) > 0) {
                        <a [routerLink]="['/tasks', task.id]" class="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                          {{ commentCounts().get(task.id) }}
                        </a>
                      }
                      @if ((attachmentCounts().get(task.id) ?? 0) > 0) {
                        <a [routerLink]="['/tasks', task.id]" class="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 10-5.656-5.656l-6.415 6.585a6 6 0 108.485 8.486L20.5 13"/></svg>
                          {{ attachmentCounts().get(task.id) }}
                        </a>
                      }
                    </div>
                    @if (task.status === 'REJECTED' && task.reviewReason) {
                      <p class="text-xs text-red-600 mt-1.5">Rejected: {{ task.reviewReason }}</p>
                    }
                    @if (task.status === 'COMPLETED') {
                      <p class="text-xs text-amber-600 mt-1.5">Waiting for reviewer approval</p>
                    }
                    @if (task.status === 'APPROVED') {
                      <p class="text-xs text-emerald-600 mt-1.5">✓ Approved</p>
                    }
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    @if (task.status === 'TODO') {
                      <button
                        (click)="changeStatus(task, 'IN_PROGRESS')"
                        [disabled]="updatingId() === task.id"
                        class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg border border-blue-200 disabled:opacity-50"
                      >
                        Start Work
                      </button>
                    }
                    @if (task.status === 'IN_PROGRESS') {
                      <button
                        (click)="changeStatus(task, 'COMPLETED')"
                        [disabled]="updatingId() === task.id"
                        class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-200 disabled:opacity-50"
                      >
                        Mark Complete
                      </button>
                    }
                    @if (task.status === 'REJECTED') {
                      <button
                        (click)="changeStatus(task, 'IN_PROGRESS')"
                        [disabled]="updatingId() === task.id"
                        class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-lg border border-amber-200 disabled:opacity-50"
                      >
                        Restart
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class MyTasksComponent implements OnInit {
  tasks = signal<Task[]>([]);
  loading = signal(true);
  activeFilter = signal<StatusFilter>('');
  updatingId = signal<number | null>(null);

  // taskId -> count, populated after the task list loads (see loadCounts()).
  commentCounts = signal<Map<number, number>>(new Map());
  attachmentCounts = signal<Map<number, number>>(new Map());

  // Only statuses the assignee can be in / act on. APPROVED/REJECTED shown
  // for visibility, but action buttons only render for TODO/IN_PROGRESS/REJECTED
  // — matching the assignee transition rules in updateTaskStatusService:
  // TODO -> IN_PROGRESS -> COMPLETED, and REJECTED -> IN_PROGRESS.
  statusFilters: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: '' },
    { label: 'Todo', value: 'TODO' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Approved', value: 'APPROVED' },
  ];

  constructor(
    private taskSvc: TaskService,
    private auth: AuthService,
    private commentSvc: TaskCommentService,
    private attSvc: TaskAttachmentService,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    const currentUserId = this.auth.currentUser()?.id;
    // NOTE: assignedTo isn't part of the typed TaskFilters interface yet —
    // cast to any like the rest of the codebase does for ad-hoc params.
    // If TaskFilters already supports assignedTo, drop the cast.
    const params: any = { assignedTo: currentUserId, isActive: true, limit: 50 };
    if (this.activeFilter()) params.status = this.activeFilter();

    this.taskSvc.getTasks(params).subscribe({
      next: (r) => {
        this.tasks.set(r.data.tasks);
        this.loading.set(false);
        this.loadCounts(r.data.tasks);
      },
      error: () => this.loading.set(false),
    });
  }

  // Fetches comment + attachment counts for every visible task in parallel.
  // NOTE: this is N+1 (2 requests per task) — fine for a 10-50 row page,
  // but if the list grows large, ask the backend to return commentsCount /
  // attachmentsCount directly on the task list/review-queue response instead.
  loadCounts(tasks: Task[]) {
    if (!tasks.length) {
      this.commentCounts.set(new Map());
      this.attachmentCounts.set(new Map());
      return;
    }
    const requests = tasks.map((t) =>
      forkJoin({
        taskId: of(t.id),
        comments: this.commentSvc.getComments(t.id).pipe(
          catchError(() => of({ success: false, data: [] as TaskComment[] })),
        ),
        attachments: this.attSvc.getAttachments(t.id).pipe(
          catchError(() => of({ success: false, data: [] as TaskAttachment[] })),
        ),
      }),
    );
    forkJoin(requests).subscribe((results) => {
      const cCounts = new Map<number, number>();
      const aCounts = new Map<number, number>();
      results.forEach((r) => {
        cCounts.set(r.taskId, r.comments.data.length);
        aCounts.set(r.taskId, r.attachments.data.length);
      });
      this.commentCounts.set(cCounts);
      this.attachmentCounts.set(aCounts);
    });
  }

  setFilter(f: StatusFilter) {
    this.activeFilter.set(f);
    this.load();
  }

  changeStatus(task: Task, status: TaskStatus) {
    this.updatingId.set(task.id);
    this.taskSvc.updateTaskStatus(task.id, { status }).subscribe({
      next: () => {
        this.updatingId.set(null);
        this.load();
      },
      error: () => this.updatingId.set(null),
    });
  }
}