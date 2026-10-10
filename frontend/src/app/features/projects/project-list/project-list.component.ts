import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project, ProjectFilters, ProjectStatus, ProjectPriority } from '../../../core/models/project.model';
import { Pagination } from '../../../core/models/user.model';
import { PERMISSIONS } from '../../../core/constants/permissions.constant';
import { BadgeComponent, ConfirmDialogComponent, PaginationComponent } from '../../../shared';
import { ProjectFormComponent } from '../project-form/project-form.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    BadgeComponent,
    ConfirmDialogComponent,
    PaginationComponent,
    ProjectFormComponent,
  ],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              Architecture Layer
            </span>
            <span class="text-xs text-gray-400 font-medium">Organization → Project → Task</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Projects</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            {{ pagination()?.totalRecords ?? 0 }} total project initiatives
          </p>
        </div>

        @if (auth.hasPermission(PERMISSIONS.CREATE_PROJECT)) {
          <button
            (click)="openCreate()"
            class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            New Project
          </button>
        }
      </div>

      <!-- Filters Bar -->
      <div class="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 shadow-sm items-center">
        <div class="relative flex-1 min-w-56">
          <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            [(ngModel)]="filters.search"
            (ngModelChange)="resetAndLoad()"
            placeholder="Search projects by name, key, or description…"
            class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all"
          />
        </div>

        <select
          [(ngModel)]="filters.status"
          (ngModelChange)="resetAndLoad()"
          class="px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PLANNED">Planned</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          [(ngModel)]="filters.priority"
          (ngModelChange)="resetAndLoad()"
          class="px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all"
        >
          <option value="">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <select
          [(ngModel)]="isActiveFilter"
          (ngModelChange)="resetAndLoad()"
          class="px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all"
        >
          <option value="true">Active</option>
          <option value="false">Archived / Deleted</option>
        </select>
      </div>

      <!-- Project Cards Grid -->
      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm animate-pulse">
              <div class="flex items-center justify-between mb-4">
                <div class="h-5 bg-gray-200 rounded w-16"></div>
                <div class="h-5 bg-gray-200 rounded w-20"></div>
              </div>
              <div class="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div class="h-2.5 bg-gray-200 rounded w-full mb-4"></div>
              <div class="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          }
        </div>
      } @else if (projects().length === 0) {
        <div class="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-1">No projects found</h3>
          <p class="text-xs text-gray-500 max-w-sm mx-auto mb-5">
            Projects act as containers for tasks, connecting your organization to individual deliverables.
          </p>
          @if (auth.hasPermission(PERMISSIONS.CREATE_PROJECT)) {
            <button
              (click)="openCreate()"
              class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Create your first project
            </button>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (p of projects(); track p.id) {
            <div class="bg-white border border-gray-200 hover:border-indigo-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <!-- Top Badges -->
                <div class="flex items-center justify-between gap-2 mb-3">
                  <span class="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 tracking-wider">
                    {{ p.key || 'PROJ' }}
                  </span>
                  <div class="flex items-center gap-1.5">
                    <span
                      class="px-2 py-0.5 text-[11px] font-semibold rounded-md"
                      [ngClass]="{
                        'bg-emerald-50 text-emerald-700 border border-emerald-200': p.status === 'ACTIVE' || p.status === 'COMPLETED',
                        'bg-blue-50 text-blue-700 border border-blue-200': p.status === 'PLANNED',
                        'bg-amber-50 text-amber-700 border border-amber-200': p.status === 'ON_HOLD',
                        'bg-rose-50 text-rose-700 border border-rose-200': p.status === 'CANCELLED'
                      }"
                    >
                      {{ p.status }}
                    </span>
                    <app-badge type="priority" [value]="p.priority" />
                  </div>
                </div>

                <!-- Title & Description -->
                <a
                  [routerLink]="['/projects', p.id]"
                  class="block text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5"
                >
                  {{ p.name }}
                </a>

                <p class="text-xs text-gray-500 line-clamp-2 min-h-[32px] mb-4">
                  {{ p.description || 'No description provided for this project.' }}
                </p>

                <!-- Progress Bar -->
                <div class="mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div class="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span class="text-gray-600">Tasks Progress</span>
                    <span class="text-indigo-600">{{ p.progress ?? 0 }}%</span>
                  </div>
                  <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                      [style.width.%]="p.progress ?? 0"
                    ></div>
                  </div>

                  <!-- Task count tags -->
                  <div class="flex items-center justify-between text-[11px] text-gray-400 mt-2">
                    <span>{{ p.taskStats?.completed ?? 0 }}/{{ p.taskStats?.total ?? 0 }} Done</span>
                    <span>{{ p.taskStats?.inProgress ?? 0 }} In Progress</span>
                    <span>{{ p.taskStats?.todo ?? 0 }} Todo</span>
                  </div>
                </div>
              </div>

              <!-- Footer with Dates, Creator & Actions -->
              <div class="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
                <div class="min-w-0">
                  @if (p.endDate) {
                    <p class="text-[11px] text-gray-500 truncate flex items-center gap-1">
                      <svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      Due {{ p.endDate | date: 'MMM d, yyyy' }}
                    </p>
                  } @else {
                    <p class="text-[11px] text-gray-400 truncate">
                      by {{ p.creator?.firstName }} {{ p.creator?.lastName ?? '' }}
                    </p>
                  }
                </div>

                <div class="flex items-center gap-1">
                  @if (auth.hasPermission(PERMISSIONS.UPDATE_PROJECT)) {
                    <button
                      (click)="openEdit(p)"
                      title="Edit project"
                      class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                  }

                  @if (auth.hasPermission(PERMISSIONS.DELETE_PROJECT)) {
                    <button
                      (click)="confirmDelete(p)"
                      title="Delete project"
                      class="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  }

                  <a
                    [routerLink]="['/projects', p.id]"
                    class="ml-1 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    View
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          }
        </div>

        @if (pagination()) {
          <div class="mt-6">
            <app-pagination
              [pagination]="pagination()"
              (pageChange)="onPageChange($event)"
            />
          </div>
        }
      }

      <!-- Modals -->
      @if (showForm()) {
        <app-project-form
          [project]="selectedProject()"
          (saved)="onSaved($event)"
          (cancelled)="closeForm()"
        />
      }

      @if (deletingProject()) {
        <app-confirm-dialog
          [open]="true"
          title="Delete Project"
          [message]="'Are you sure you want to delete project \\'' + deletingProject()!.name + '\\'? Its tasks will remain in the system.'"
          confirmLabel="Delete"
          [destructive]="true"
          (confirm)="onDeleteConfirmed()"
          (cancel)="deletingProject.set(null)"
        />
      }
    </div>
  `,
})
export class ProjectListComponent implements OnInit {
  readonly PERMISSIONS = PERMISSIONS;

  projects = signal<Project[]>([]);
  pagination = signal<Pagination | null>(null);
  loading = signal(false);

  filters: ProjectFilters = {
    page: 1,
    limit: 9,
    status: '',
    priority: '',
    search: '',
  };

  isActiveFilter: string = 'true';

  showForm = signal(false);
  selectedProject = signal<Project | null>(null);
  deletingProject = signal<Project | null>(null);

  constructor(
    public auth: AuthService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  resetAndLoad(): void {
    this.filters.page = 1;
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    const query: ProjectFilters = {
      ...this.filters,
      isActive: this.isActiveFilter !== '' ? this.isActiveFilter : undefined,
    };

    this.projectService.getProjects(query).subscribe({
      next: (res) => {
        this.projects.set(res.data.projects);
        this.pagination.set(res.data.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadProjects();
  }

  openCreate(): void {
    this.selectedProject.set(null);
    this.showForm.set(true);
  }

  openEdit(project: Project): void {
    this.selectedProject.set(project);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.selectedProject.set(null);
  }

  onSaved(saved: Project): void {
    this.closeForm();
    this.loadProjects();
  }

  confirmDelete(project: Project): void {
    this.deletingProject.set(project);
  }

  onDeleteConfirmed(): void {
    const p = this.deletingProject();
    if (!p) return;

    this.projectService.deleteProject(p.id).subscribe({
      next: () => {
        this.deletingProject.set(null);
        this.loadProjects();
      },
      error: () => {
        this.deletingProject.set(null);
      },
    });
  }
}
