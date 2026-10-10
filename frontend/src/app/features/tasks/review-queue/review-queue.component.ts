import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TaskService } from '../../../core/services/task.service';
import { TaskCommentService } from '../../../core/services/task-comment.service';
import { TaskAttachmentService } from '../../../core/services/task-attachment.service';
import { Task } from '../../../core/models/task.model';
import { TaskComment } from '../../../core/models/task-comment.model';
import { TaskAttachment } from '../../../core/models/task-attachment.model';
import { BadgeComponent, LoadingSpinnerComponent, EmptyStateComponent } from '../../../shared';

@Component({
  selector: 'app-review-queue', standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, BadgeComponent, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-xl font-semibold text-slate-900">Review Queue</h1>
        <p class="text-sm text-slate-500 mt-0.5">{{ tasks().length }} task{{ tasks().length!==1?'s':'' }} awaiting your review</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
        @if (loading()) { <app-loading-spinner [padding]="48"/> }
        @else if (tasks().length===0) { <app-empty-state icon="tasks" title="Queue is clear" description="No tasks awaiting your review"/> }
        @else {
          <div class="divide-y divide-slate-100">
            @for (task of tasks(); track task.id) {
              <div class="p-4 hover:bg-slate-50 transition-colors">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <a [routerLink]="['/tasks', task.id]" class="font-medium text-slate-800 hover:text-indigo-600 transition-colors text-sm">{{ task.title }}</a>
                    <div class="flex items-center flex-wrap gap-2 mt-1.5">
                      <app-badge type="status" [value]="task.status"/>
                      <app-badge type="priority" [value]="task.priority"/>
                      @if (task.assignee) { <span class="text-xs text-slate-400">by {{ task.assignee.firstName }} {{ task.assignee.lastName??'' }}</span> }
                      @if (task.slaHours !== null) {
                        <span class="text-xs" [class]="task.isDelayed?'text-red-500':'text-slate-400'">
                          {{ task.slaHours | number:'1.1-1' }}h SLA {{ task.isDelayed?'· ⚠ delayed':'· on time' }}
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
                    @if (task.description) { <p class="text-xs text-slate-400 mt-1.5 line-clamp-2">{{ task.description }}</p> }
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <button (click)="approve(task)"
                      class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-200 transition-colors">
                      ✓ Approve
                    </button>
                    <button (click)="openReject(task)"
                      class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg border border-red-200 transition-colors">
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
    @if (rejectingTask()) {
      <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-md shadow-xl">
          <h2 class="font-semibold text-slate-900 mb-1">Reject task</h2>
          <p class="text-sm text-slate-500 mb-4">Rejection reason is required. The assignee will be notified via email and notification.</p>
          <form [formGroup]="rejectForm" (ngSubmit)="submitReject()">
            <textarea formControlName="reviewReason" rows="3" placeholder="Describe what needs to be fixed…"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              [class.border-red-300]="rejectForm.get('reviewReason')?.invalid && rejectForm.get('reviewReason')?.touched">
            </textarea>
            @if (rejectForm.get('reviewReason')?.invalid && rejectForm.get('reviewReason')?.touched) {
              <p class="text-xs text-red-500 mt-1">Reason is required</p>
            }
            <div class="flex justify-end gap-3 mt-4">
              <button type="button" (click)="rejectingTask.set(null)"
                class="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button type="submit"
                class="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Reject task</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class ReviewQueueComponent implements OnInit {
  tasks = signal<Task[]>([]); loading = signal(true); rejectingTask = signal<Task|null>(null);
  rejectForm: FormGroup;

  // taskId -> count, populated after the queue loads (see loadCounts()).
  commentCounts = signal<Map<number, number>>(new Map());
  attachmentCounts = signal<Map<number, number>>(new Map());

  constructor(
    private taskSvc: TaskService,
    private fb: FormBuilder,
    private commentSvc: TaskCommentService,
    private attSvc: TaskAttachmentService,
  ) {
    this.rejectForm = this.fb.group({ reviewReason: ['', [Validators.required, Validators.minLength(3)]] });
  }
  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.taskSvc.getReviewQueue({ limit: 50 }).subscribe({
      next: r => {
        this.tasks.set(r.data.tasks);
        this.loading.set(false);
        this.loadCounts(r.data.tasks);
      },
      error: () => this.loading.set(false),
    });
  }

  // Fetches comment + attachment counts for every visible task in parallel.
  // NOTE: this is N+1 (2 requests per task) — fine for a 10-50 row queue,
  // but if it grows large, ask the backend to return commentsCount /
  // attachmentsCount directly on the review-queue response instead.
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

  approve(task: Task) {
    this.taskSvc.updateTaskStatus(task.id, { status: 'APPROVED' }).subscribe({ next: () => this.load() });
  }
  openReject(task: Task) { this.rejectingTask.set(task); this.rejectForm.reset(); }
  submitReject() {
    if (this.rejectForm.invalid) { this.rejectForm.markAllAsTouched(); return; }
    const task = this.rejectingTask();
    if (!task) return;
    this.taskSvc.updateTaskStatus(task.id, { status: 'REJECTED', reviewReason: this.rejectForm.value.reviewReason.trim() }).subscribe({
      next: () => { this.rejectingTask.set(null); this.load(); },
    });
  }
}