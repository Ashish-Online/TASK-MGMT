import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task, CreateTaskRequest, UpdateTaskRequest, AssignTaskRequest, TaskPriority } from '../../../core/models/task.model';
import { User } from '../../../core/models/user.model';
import { PERMISSIONS } from '../../../core/constants/permissions.constant';
import { ErrorBannerComponent } from '../../../shared';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorBannerComponent],
  template: `
    <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div
        class="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <h2 class="font-semibold text-slate-900 mb-5">{{ task ? 'Edit Task' : 'New Task' }}</h2>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="mb-4">
            <label class="block text-xs font-medium text-slate-600 mb-1.5">Title *</label>
            <input
              formControlName="title"
              placeholder="What needs to be done?"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              [class.border-red-300]="isInvalid('title')"
            />
            @if (isInvalid('title')) {
              <p class="text-xs text-red-500 mt-1">Title is required</p>
            }
          </div>
          <div class="mb-4">
            <label class="block text-xs font-medium text-slate-600 mb-1.5">Description</label>
            <textarea
              formControlName="description"
              rows="3"
              placeholder="Add more details…"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            ></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1.5">Priority</label>
              <select
                formControlName="priority"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1.5">Due Date</label>
              <input
                formControlName="dueDate"
                type="date"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          @if (auth.hasAnyPermission(PERMISSIONS.ASSIGN_TASK, PERMISSIONS.CREATE_TASK)) {
            <div class="mb-4">
              <label class="block text-xs font-medium text-slate-600 mb-1.5">Assign To</label>
              <select
                formControlName="assignedTo"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option [value]="null">Unassigned</option>
                @for (u of users(); track u.id) {
                  <option [value]="u.id">{{ u.firstName }} {{ u.lastName ?? '' }}</option>
                }
              </select>
              @if (!usersLoading() && users().length === 0) {
                <p class="text-xs text-amber-600 mt-1">
                  No users available to assign. {{ usersError() ? usersError() : 'Check user list / permissions.' }}
                </p>
              }
            </div>
          }
          <div class="mb-5">
            <label class="block text-xs font-medium text-slate-600 mb-1.5"
              >Reviewer
              <span class="font-normal text-slate-400"
                >(must have APPROVE_TASK permission)</span
              ></label
            >
            <select
              formControlName="reviewerId"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option [value]="null">No reviewer</option>
              @for (u of users(); track u.id) {
                <option [value]="u.id">{{ u.firstName }} {{ u.lastName ?? '' }}</option>
              }
            </select>
            <p class="text-xs text-slate-400 mt-1">
              Server validates APPROVE_TASK permission — invalid reviewer returns 400
            </p>
          </div>
          <app-error-banner [message]="error()" (dismiss)="error.set(null)" />
          <div class="flex justify-end gap-3 mt-4">
            <button
              type="button"
              (click)="cancel.emit()"
              class="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="saving()"
              class="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-2"
            >
              @if (saving()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              }
              {{ task ? 'Save Changes' : 'Create Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() saved = new EventEmitter<Task>();
  @Output() cancel = new EventEmitter<void>();
  readonly PERMISSIONS = PERMISSIONS;
  form: FormGroup;
  users = signal<User[]>([]);
  usersLoading = signal(true);
  usersError = signal<string | null>(null);
  saving = signal(false);
  error = signal<string | null>(null);
  constructor(
    public auth: AuthService,
    private fb: FormBuilder,
    private taskSvc: TaskService,
    private userSvc: UserService,
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      priority: ['MEDIUM'],
      dueDate: [null],
      assignedTo: [null],
      reviewerId: [null],
    });
  }
  ngOnInit() {
    this.loadUsers();
    if (this.task)
      this.form.patchValue({
        title: this.task.title,
        description: this.task.description ?? '',
        priority: this.task.priority,
        dueDate: this.task.dueDate?.split('T')[0] ?? null,
        assignedTo: this.task.assignedTo,
        reviewerId: this.task.reviewerId,
      });
  }
  // FIXED: was silently failing (no error handler) when /user request errored,
  // and assumed response shape was always { data: { users: [...] } }.
  // Now handles both shapes defensively and surfaces failures instead of
  // leaving both dropdowns empty with no explanation.
  loadUsers() {
    this.usersLoading.set(true);
    this.usersError.set(null);
    this.userSvc.getUsers({ isActive: true, limit: 100 } as any).subscribe({
      next: (r: any) => {
        const list: User[] = Array.isArray(r?.data) ? r.data : (r?.data?.users ?? []);
        this.users.set(list);
        this.usersLoading.set(false);
        if (!list.length) {
          console.warn(
            '[TaskFormComponent] getUsers() returned 0 users — check API response shape (expected data.users or data[]) and that the current user has permission to list users.',
          );
        }
      },
      error: (e: any) => {
        console.error('[TaskFormComponent] Failed to load users for assignee/reviewer dropdowns:', e);
        this.usersLoading.set(false);
        this.usersError.set(e?.error?.message || e?.message || 'Failed to load users.');
      },
    });
  }
  isInvalid(f: string) {
    const c = this.form.get(f);
    return !!(c?.invalid && c?.touched);
  }
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const v = this.form.value;

    if (this.task) {
      // FIXED: editing no longer pushes assignedTo through the generic
      // update endpoint. Reassignment now goes through the dedicated
      // assignTask() / PATCH /task/:id/assign endpoint instead.
      const updatePayload: UpdateTaskRequest = {
        title: v.title,
        description: v.description || undefined,
        priority: v.priority as TaskPriority,
        reviewerId: v.reviewerId ? Number(v.reviewerId) : undefined,
        dueDate: v.dueDate || undefined,
      };
      const newAssignedTo = v.assignedTo ? Number(v.assignedTo) : null;
      const assigneeChanged = newAssignedTo !== (this.task.assignedTo ?? null);

      this.taskSvc.updateTask(this.task.id, updatePayload).subscribe({
        next: (r) => {
          if (!assigneeChanged) {
            this.saved.emit(r.data);
            this.saving.set(false);
            return;
          }
          const assignPayload: AssignTaskRequest = { assignedTo: newAssignedTo };
          this.taskSvc.assignTask(this.task!.id, assignPayload).subscribe({
            next: (r2) => {
              this.saved.emit(r2.data);
              this.saving.set(false);
            },
            error: (e: Error) => {
              this.error.set(e.message);
              this.saving.set(false);
            },
          });
        },
        error: (e: Error) => {
          this.error.set(e.message);
          this.saving.set(false);
        },
      });
    } else {
      // Creating: there's no task id yet to call /assign on, so assignedTo
      // is still set as part of the create payload.
      const createPayload: CreateTaskRequest = {
        title: v.title,
        description: v.description || undefined,
        priority: v.priority as TaskPriority,
        assignedTo: v.assignedTo ? Number(v.assignedTo) : undefined,
        reviewerId: v.reviewerId ? Number(v.reviewerId) : undefined,
        dueDate: v.dueDate || undefined,
      };
      this.taskSvc.createTask(createPayload).subscribe({
        next: (r) => {
          this.saved.emit(r.data);
          this.saving.set(false);
        },
        error: (e: Error) => {
          this.error.set(e.message);
          this.saving.set(false);
        },
      });
    }
  }
}