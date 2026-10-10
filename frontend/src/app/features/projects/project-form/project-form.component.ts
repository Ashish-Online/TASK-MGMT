import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { Project, ProjectPriority, ProjectStatus } from '../../../core/models/project.model';
import { ErrorBannerComponent } from '../../../shared';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorBannerComponent],
  template: `
    <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold text-slate-900">{{ project ? 'Edit Project' : 'New Project' }}</h2>
          <button (click)="cancelled.emit()" type="button" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        @if (error()) {
          <app-error-banner [message]="error()!" class="mb-4 block" />
        }

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="mb-4">
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Project Name *</label>
            <input
              formControlName="name"
              placeholder="e.g. Customer Portal Redesign"
              class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
              [class.border-red-300]="isInvalid('name')"
            />
            @if (isInvalid('name')) {
              <p class="text-xs text-red-500 mt-1">Project name is required (max 150 characters)</p>
            }
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Project Key</label>
              <input
                formControlName="key"
                placeholder="e.g. PORTAL"
                class="w-full px-3.5 py-2 text-sm uppercase border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
              />
              <p class="text-[11px] text-slate-400 mt-1">Short identifier (auto-generated if empty)</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Priority</label>
              <select
                formControlName="priority"
                class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
            <select
              formControlName="status"
              class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
            >
              <option value="ACTIVE">Active</option>
              <option value="PLANNED">Planned</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea
              formControlName="description"
              rows="3"
              placeholder="What are the goals and deliverables of this project?"
              class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white resize-none transition-all"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Start Date</label>
              <input
                formControlName="startDate"
                type="date"
                class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">End Date / Deadline</label>
              <input
                formControlName="endDate"
                type="date"
                class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              (click)="cancelled.emit()"
              class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="loading() || form.invalid"
              class="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all shadow-sm"
            >
              {{ loading() ? 'Saving…' : project ? 'Save Changes' : 'Create Project' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ProjectFormComponent implements OnInit {
  @Input() project: Project | null = null;
  @Output() saved = new EventEmitter<Project>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.project?.name ?? '', [Validators.required, Validators.maxLength(150)]],
      key: [this.project?.key ?? '', [Validators.maxLength(20)]],
      description: [this.project?.description ?? ''],
      status: [this.project?.status ?? 'ACTIVE'],
      priority: [this.project?.priority ?? 'MEDIUM'],
      startDate: [this.project?.startDate ? this.project.startDate.substring(0, 10) : ''],
      endDate: [this.project?.endDate ? this.project.endDate.substring(0, 10) : ''],
    });
  }

  isInvalid(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  submit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const val = this.form.value;
    const payload = {
      name: val.name.trim(),
      key: val.key ? val.key.trim().toUpperCase() : undefined,
      description: val.description ? val.description.trim() : undefined,
      status: val.status as ProjectStatus,
      priority: val.priority as ProjectPriority,
      startDate: val.startDate || null,
      endDate: val.endDate || null,
    };

    const req$ = this.project ? this.projectService.updateProject(this.project.id, payload) : this.projectService.createProject(payload);

    req$.subscribe({
      next: (res) => {
        this.loading.set(false);
        this.saved.emit(res.data);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to save project. Please try again.');
      },
    });
  }
}
