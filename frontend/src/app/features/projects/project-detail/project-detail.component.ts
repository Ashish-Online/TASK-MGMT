import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project } from '../../../core/models/project.model';
import { Task, TaskFilters, TaskStatus } from '../../../core/models/task.model';
import { Pagination } from '../../../core/models/user.model';
import { PERMISSIONS } from '../../../core/constants/permissions.constant';
import { BadgeComponent, PaginationComponent } from '../../../shared';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { TaskFormComponent } from '../../tasks/task-form/task-form.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    BadgeComponent,
    PaginationComponent,
    ProjectFormComponent,
    TaskFormComponent,
  ],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Back button -->
      <a
        routerLink="/projects"
        class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 group transition-colors"
      >
        <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to projects
      </a>

      @if (loadingProject()) {
        <div class="animate-pulse space-y-6">
          <div class="h-28 bg-gray-200 rounded-2xl"></div>
          <div class="grid grid-cols-4 gap-4">
            <div class="h-24 bg-gray-200 rounded-2xl"></div>
            <div class="h-24 bg-gray-200 rounded-2xl"></div>
            <div class="h-24 bg-gray-200 rounded-2xl"></div>
            <div class="h-24 bg-gray-200 rounded-2xl"></div>
          </div>
          <div class="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      } @else if (!project()) {
        <div class="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 class="text-base font-bold text-gray-900 mb-1">Project Not Found</h2>
          <p class="text-xs text-gray-500 mb-4">The project you are looking for does not exist or has been removed.</p>
          <a routerLink="/projects" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
            Return to Projects
          </a>
        </div>
      } @else {
        <!-- Project Banner -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <span class="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 tracking-wider">
                  {{ project()!.key || 'PROJ' }}
                </span>
                <span
                  class="px-2.5 py-0.5 text-xs font-semibold rounded-md"
                  [ngClass]="{
                    'bg-emerald-50 text-emerald-700 border border-emerald-200': project()!.status === 'ACTIVE' || project()!.status === 'COMPLETED',
                    'bg-blue-50 text-blue-700 border border-blue-200': project()!.status === 'PLANNED',
                    'bg-amber-50 text-amber-700 border border-amber-200': project()!.status === 'ON_HOLD',
                    'bg-rose-50 text-rose-700 border border-rose-200': project()!.status === 'CANCELLED'
                  }"
                >
                  {{ project()!.status }}
                </span>
                <app-badge type="priority" [value]="project()!.priority" />
              </div>

              <h1 class="text-2xl font-bold text-gray-900 leading-tight mb-2">{{ project()!.name }}</h1>

              @if (project()!.description) {
                <p class="text-sm text-gray-600 leading-relaxed max-w-3xl whitespace-pre-wrap mb-4">
                  {{ project()!.description }}
                </p>
              }

              <!-- Metadata info bar -->
              <div class="flex flex-wrap items-center gap-6 text-xs text-gray-500">
                @if (project()!.creator) {
                  <div>
                    <span class="text-gray-400">Created by: </span>
                    <span class="font-medium text-gray-700">{{ project()!.creator!.firstName }} {{ project()!.creator!.lastName ?? '' }}</span>
                  </div>
                }
                @if (project()!.startDate) {
                  <div>
                    <span class="text-gray-400">Start: </span>
                    <span class="font-medium text-gray-700">{{ project()!.startDate | date: 'MMM d, yyyy' }}</span>
                  </div>
                }
                @if (project()!.endDate) {
                  <div>
                    <span class="text-gray-400">Deadline: </span>
                    <span class="font-medium text-gray-700">{{ project()!.endDate | date: 'MMM d, yyyy' }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-2 flex-shrink-0">
              @if (auth.hasPermission(PERMISSIONS.UPDATE_PROJECT)) {
                <button
                  (click)="showEditProject.set(true)"
                  class="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
                >
                  <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Edit Project
                </button>
              }

              @if (auth.hasPermission(PERMISSIONS.CREATE_TASK)) {
                <button
                  (click)="showCreateTask.set(true)"
                  class="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-sm"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                  </svg>
                  New Task in Project
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Metric Summary Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p class="text-xs text-gray-400 font-medium mb-1">Total Tasks</p>
            <p class="text-2xl font-bold text-gray-900">{{ project()!.taskStats?.total ?? 0 }}</p>
          </div>

          <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p class="text-xs text-gray-400 font-medium mb-1">In Progress</p>
            <p class="text-2xl font-bold text-blue-600">{{ project()!.taskStats?.inProgress ?? 0 }}</p>
          </div>

          <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p class="text-xs text-gray-400 font-medium mb-1">Completed / Approved</p>
            <p class="text-2xl font-bold text-emerald-600">{{ project()!.taskStats?.completed ?? 0 }}</p>
          </div>

          <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div class="flex items-center justify-between mb-1">
              <p class="text-xs text-gray-400 font-medium">Completion Rate</p>
              <span class="text-xs font-bold text-indigo-600">{{ project()!.progress ?? 0 }}%</span>
            </div>
            <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mt-2">
              <div
                class="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                [style.width.%]="project()!.progress ?? 0"
              ></div>
            </div>
          </div>
        </div>

        <!-- Project Tasks Section -->
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
          <!-- Section Header & Filters -->
          <div class="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-base font-bold text-gray-900">Project Tasks</h2>
              <p class="text-xs text-gray-400 mt-0.5">Tasks configured under {{ project()!.name }}</p>
            </div>

            <div class="flex items-center gap-3 flex-wrap">
              <input
                [(ngModel)]="taskFilters.search"
                (ngModelChange)="resetTasksAndLoad()"
                placeholder="Search tasks in project…"
                class="px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white w-48 transition-all"
              />

              <select
                [(ngModel)]="taskFilters.status"
                (ngModelChange)="resetTasksAndLoad()"
                class="px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all"
              >
                <option value="">All statuses</option>
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <!-- Tasks Table -->
          @if (loadingTasks()) {
            <div class="p-8 text-center text-xs text-gray-400">Loading project tasks…</div>
          } @else if (tasks().length === 0) {
            <div class="p-12 text-center">
              <div class="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <p class="text-sm font-semibold text-gray-700">No tasks in this project yet</p>
              <p class="text-xs text-gray-400 mt-1 mb-4">Add tasks to track execution under this project layer</p>
              @if (auth.hasPermission(PERMISSIONS.CREATE_TASK)) {
                <button
                  (click)="showCreateTask.set(true)"
                  class="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  Create task in this project
                </button>
              }
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100 bg-gray-50/75 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th class="px-5 py-3">Task</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3">Priority</th>
                    <th class="px-4 py-3">Assignee</th>
                    <th class="px-4 py-3">Reviewer</th>
                    <th class="px-4 py-3">Due Date</th>
                    <th class="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (t of tasks(); track t.id) {
                    <tr class="hover:bg-gray-50/80 transition-colors">
                      <td class="px-5 py-3.5 font-medium text-gray-900">
                        <a [routerLink]="['/tasks', t.id]" class="hover:text-indigo-600 transition-colors">
                          {{ t.title }}
                        </a>
                      </td>
                      <td class="px-4 py-3.5">
                        <app-badge type="status" [value]="t.status" />
                      </td>
                      <td class="px-4 py-3.5">
                        <app-badge type="priority" [value]="t.priority" />
                      </td>
                      <td class="px-4 py-3.5 text-xs text-gray-600">
                        {{ t.assignee ? t.assignee.firstName + ' ' + (t.assignee.lastName ?? '') : '—' }}
                      </td>
                      <td class="px-4 py-3.5 text-xs text-gray-600">
                        {{ t.reviewer ? t.reviewer.firstName + ' ' + (t.reviewer.lastName ?? '') : '—' }}
                      </td>
                      <td class="px-4 py-3.5 text-xs" [class]="t.isDelayed ? 'text-red-600 font-semibold' : 'text-gray-500'">
                        {{ t.dueDate ? (t.dueDate | date: 'MMM d, yyyy') : '—' }}
                        @if (t.isDelayed) {
                          <span class="ml-1 text-[10px] text-red-500 font-bold">⚠ Overdue</span>
                        }
                      </td>
                      <td class="px-5 py-3.5 text-right">
                        <a
                          [routerLink]="['/tasks', t.id]"
                          class="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          Details
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (tasksPagination()) {
              <div class="p-4 border-t border-gray-100">
                <app-pagination
                  [pagination]="tasksPagination()"
                  (pageChange)="onTaskPageChange($event)"
                />
              </div>
            }
          }
        </div>
      }

      <!-- Modals -->
      @if (showEditProject()) {
        <app-project-form
          [project]="project()"
          (saved)="onProjectUpdated($event)"
          (cancelled)="showEditProject.set(false)"
        />
      }

      @if (showCreateTask()) {
        <app-task-form
          [defaultProjectId]="project()!.id"
          (saved)="onTaskCreated($event)"
          (cancel)="showCreateTask.set(false)"
        />
      }
    </div>
  `,
})
export class ProjectDetailComponent implements OnInit {
  readonly PERMISSIONS = PERMISSIONS;

  projectId!: number;
  project = signal<Project | null>(null);
  loadingProject = signal(true);

  tasks = signal<Task[]>([]);
  tasksPagination = signal<Pagination | null>(null);
  loadingTasks = signal(false);

  taskFilters: TaskFilters = {
    page: 1,
    limit: 10,
    status: undefined,
    search: '',
  };

  showEditProject = signal(false);
  showCreateTask = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthService,
    private projectService: ProjectService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.projectId = Number(id);
        this.loadProjectDetails();
        this.loadProjectTasks();
      }
    });
  }

  loadProjectDetails(): void {
    this.loadingProject.set(true);
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (res) => {
        this.project.set(res.data);
        this.loadingProject.set(false);
      },
      error: () => {
        this.loadingProject.set(false);
      },
    });
  }

  loadProjectTasks(): void {
    this.loadingTasks.set(true);
    this.projectService.getProjectTasks(this.projectId, this.taskFilters).subscribe({
      next: (res) => {
        this.tasks.set(res.data.tasks);
        this.tasksPagination.set(res.data.pagination);
        this.loadingTasks.set(false);
      },
      error: () => {
        this.loadingTasks.set(false);
      },
    });
  }

  resetTasksAndLoad(): void {
    this.taskFilters.page = 1;
    this.loadProjectTasks();
  }

  onTaskPageChange(page: number): void {
    this.taskFilters.page = page;
    this.loadProjectTasks();
  }

  onProjectUpdated(updated: Project): void {
    this.showEditProject.set(false);
    this.loadProjectDetails();
  }

  onTaskCreated(newTask: Task): void {
    this.showCreateTask.set(false);
    this.loadProjectDetails();
    this.loadProjectTasks();
  }
}
