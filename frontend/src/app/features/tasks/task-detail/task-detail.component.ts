import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { TaskService } from '../../../core/services/task.service';
import { TaskCommentService } from '../../../core/services/task-comment.service';
import { TaskAttachmentService } from '../../../core/services/task-attachment.service';
import { TaskActivityService } from '../../../core/services/task-activity.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { TaskComment } from '../../../core/models/task-comment.model';
import { TaskAttachment } from '../../../core/models/task-attachment.model';
import { TaskActivity } from '../../../core/models/task-activity.model';
import { Pagination } from '../../../core/models/user.model';
import { PERMISSIONS } from '../../../core/constants/permissions.constant';
import {
  BadgeComponent,
  ConfirmDialogComponent,
  TimeAgoPipe,
} from '../../../shared';

type Tab = 'details' | 'comments' | 'attachments' | 'activity';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, ConfirmDialogComponent, TimeAgoPipe],
  template: `
    <div class="p-6 max-w-5xl mx-auto">

      <!-- Back button -->
      <button (click)="goBack()"
        class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 group transition-colors">
        <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to tasks
      </button>

      @if (loading()) {
        <!-- Skeleton loading -->
        <div class="animate-pulse">
          <div class="flex items-center gap-3 mb-4">
            <div class="h-6 w-20 bg-gray-200 rounded-lg"></div>
            <div class="h-6 w-16 bg-gray-200 rounded-lg"></div>
          </div>
          <div class="h-8 w-2/3 bg-gray-200 rounded-lg mb-6"></div>
          <div class="grid grid-cols-3 gap-6">
            <div class="h-48 bg-gray-200 rounded-2xl"></div>
            <div class="col-span-2 h-48 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      } @else if (!task()) {
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-sm font-semibold text-gray-700">Task not found</p>
          <button (click)="goBack()" class="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium">Go back</button>
        </div>
      } @else {

        <!-- Task header -->
        <div class="flex items-start justify-between gap-4 mb-6">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2.5 flex-wrap">
              <app-badge type="status" [value]="task()!.status" />
              <app-badge type="priority" [value]="task()!.priority" />
              @if (!task()!.isActive) {
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                  Deleted
                </span>
              }
              @if (task()!.isDelayed) {
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Overdue
                </span>
              }
            </div>
            <h1 class="text-2xl font-bold text-gray-900 leading-tight">{{ task()!.title }}</h1>
          </div>

          <!-- Action buttons -->
          <div class="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            @if (canStart()) {
              <button (click)="updateStatus('IN_PROGRESS')"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Start Work
              </button>
            }
            @if (canComplete()) {
              <button (click)="updateStatus('COMPLETED')"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Mark Complete
              </button>
            }
            @if (canRestart()) {
              <button (click)="updateStatus('IN_PROGRESS')"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm">
                Restart
              </button>
            }
            @if (auth.hasPermission(PERMISSIONS.DELETE_TASK) && task()!.isActive) {
              <button (click)="confirmDel = true"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-red-600 text-xs font-semibold rounded-xl transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete
              </button>
            }
            @if (auth.hasPermission(PERMISSIONS.RESTORE_TASK) && !task()!.isActive) {
              <button (click)="doRestore()"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm">
                Restore Task
              </button>
            }
          </div>
        </div>

        <!-- Content grid -->
        <div class="grid grid-cols-3 gap-6">

          <!-- Left sidebar: metadata -->
          <div class="col-span-1 space-y-4">
            <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Details</h3>
              <dl class="space-y-4">
                <div>
                  <dt class="text-xs font-medium text-gray-400 mb-1">Assignee</dt>
                  <dd class="flex items-center gap-2">
                    @if (task()!.assignee) {
                      <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-bold">
                        {{ task()!.assignee!.firstName[0] }}
                      </div>
                      <span class="text-sm font-medium text-gray-800">
                        {{ task()!.assignee!.firstName }} {{ task()!.assignee!.lastName ?? '' }}
                      </span>
                    } @else {
                      <span class="text-sm text-gray-400">Unassigned</span>
                    }
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-400 mb-1">Reviewer</dt>
                  <dd class="text-sm text-gray-800">
                    {{ task()!.reviewer ? task()!.reviewer!.firstName + ' ' + (task()!.reviewer!.lastName ?? '') : '—' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-400 mb-1">Created by</dt>
                  <dd class="text-sm text-gray-800">
                    {{ task()!.creator ? task()!.creator!.firstName + ' ' + (task()!.creator!.lastName ?? '') : '—' }}
                  </dd>
                </div>
                <div class="pt-3 border-t border-gray-100">
                  <dt class="text-xs font-medium text-gray-400 mb-1">Due date</dt>
                  <dd class="text-sm font-semibold" [class]="task()!.isDelayed ? 'text-red-600' : 'text-gray-800'">
                    {{ task()!.dueDate ? (task()!.dueDate! | date: 'MMM d, yyyy') : '—' }}
                  </dd>
                </div>
                @if (task()!.slaHours !== null) {
                  <div>
                    <dt class="text-xs font-medium text-gray-400 mb-1">SLA</dt>
                    <dd class="text-sm font-semibold" [class]="task()!.isDelayed ? 'text-red-600' : 'text-emerald-600'">
                      {{ task()!.slaHours | number: '1.1-1' }}h · {{ task()!.isDelayed ? 'Delayed' : 'On time' }}
                    </dd>
                  </div>
                }
                <div class="pt-3 border-t border-gray-100">
                  <dt class="text-xs font-medium text-gray-400 mb-1">Created</dt>
                  <dd class="text-xs text-gray-500">{{ task()!.created_at | date: 'MMM d, yyyy' }}</dd>
                </div>
              </dl>
            </div>

            @if (task()!.reviewReason) {
              <div class="bg-red-50 border border-red-200 rounded-2xl p-4">
                <h3 class="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Rejection Reason
                </h3>
                <p class="text-sm text-red-700 leading-relaxed">{{ task()!.reviewReason }}</p>
              </div>
            }
          </div>

          <!-- Right: tabs content -->
          <div class="col-span-2">
            <!-- Tabs -->
            <div class="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
              @for (t of computedTabs(); track t.id) {
                <button (click)="activeTab.set(t.id)"
                  class="flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all"
                  [class]="activeTab() === t.id
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'">
                  {{ t.label }}
                  @if (t.count !== null && t.count > 0) {
                    <span class="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      [class]="activeTab() === t.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'">
                      {{ t.count }}
                    </span>
                  }
                </button>
              }
            </div>

            <!-- Details tab -->
            @if (activeTab() === 'details') {
              <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                @if (task()!.description) {
                  <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ task()!.description }}</p>
                } @else {
                  <div class="text-center py-8">
                    <svg class="w-8 h-8 text-gray-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <p class="text-sm text-gray-400 italic">No description added</p>
                  </div>
                }
              </div>
            }

            <!-- Comments tab -->
            @if (activeTab() === 'comments') {
              <div class="space-y-3">
                @for (c of comments(); track c.id) {
                  <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                          {{ c.user?.firstName?.[0] ?? '?' }}
                        </div>
                        <div>
                          <p class="text-xs font-semibold text-gray-800">{{ c.user?.firstName }} {{ c.user?.lastName ?? '' }}</p>
                          <p class="text-[11px] text-gray-400">{{ c.created_at | timeAgo }}</p>
                        </div>
                      </div>
                      @if (c.userId === currentUserId) {
                        <div class="flex gap-2">
                          @if (auth.hasPermission(PERMISSIONS.UPDATE_COMMENT)) {
                            <button (click)="startEdit(c)" class="text-xs text-gray-400 hover:text-indigo-600 font-medium transition-colors">Edit</button>
                          }
                          @if (auth.hasPermission(PERMISSIONS.DELETE_COMMENT)) {
                            <button (click)="delComment(c)" class="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors">Delete</button>
                          }
                        </div>
                      }
                    </div>
                    @if (editingId() === c.id) {
                      <textarea [(ngModel)]="editText" rows="2"
                        class="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-2"></textarea>
                      <div class="flex gap-2">
                        <button (click)="saveEdit(c)" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg">Save</button>
                        <button (click)="editingId.set(null)" class="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50">Cancel</button>
                      </div>
                    } @else {
                      <p class="text-sm text-gray-700 leading-relaxed">{{ c.message }}</p>
                    }
                  </div>
                }

                <!-- Comments Pagination -->
                @if ((commentPagination()?.totalPages ?? 0) > 1) {
                  <div class="px-5 py-4 border border-gray-200 rounded-2xl flex items-center justify-between bg-white shadow-sm mb-3">
                    <p class="text-xs text-gray-500">
                      Page <span class="font-semibold text-gray-700">{{ commentPagination()?.page }}</span>
                      of <span class="font-semibold text-gray-700">{{ commentPagination()?.totalPages }}</span>
                      · <span class="font-semibold text-gray-700">{{ commentPagination()?.totalRecords }}</span> comments
                    </p>
                    <div class="flex items-center gap-2">
                      <button (click)="changeCommentPage(-1)"
                        [disabled]="(commentPagination()?.page ?? 1) <= 1"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm bg-white">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        Previous
                      </button>
                      <div class="flex items-center gap-1">
                        @for (pg of getCommentPageNumbers(); track pg) {
                          @if (pg === -1) {
                            <span class="px-1 text-gray-400 text-xs">…</span>
                          } @else {
                            <button (click)="goToCommentPage(pg)"
                              class="w-8 h-8 text-xs font-semibold rounded-lg transition-colors"
                              [class]="commentPagination()?.page === pg ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'">
                              {{ pg }}
                            </button>
                          }
                        }
                      </div>
                      <button (click)="changeCommentPage(1)"
                        [disabled]="(commentPagination()?.page ?? 1) >= (commentPagination()?.totalPages ?? 1)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm bg-white">
                        Next
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                }

                @if (comments().length === 0) {
                  <div class="text-center py-10 text-gray-400 text-sm">
                    <svg class="w-8 h-8 mx-auto mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    No comments yet. Be the first to comment.
                  </div>
                }
                @if (auth.hasPermission(PERMISSIONS.CREATE_COMMENT)) {
                  <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <textarea [(ngModel)]="newComment" rows="3" placeholder="Write a comment…"
                      class="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3"></textarea>
                    <div class="flex justify-end">
                      <button (click)="postComment()" [disabled]="!newComment.trim()"
                        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-colors">
                        Post Comment
                      </button>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Attachments tab -->
            @if (activeTab() === 'attachments') {
              <div class="space-y-3">
                @if (auth.hasPermission(PERMISSIONS.CREATE_ATTACHMENT)) {
                  <div class="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                    (click)="fileInput.click()">
                    <div class="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center mx-auto mb-3 transition-colors">
                      <svg class="w-6 h-6 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                    </div>
                    <p class="text-sm font-medium text-gray-700">Click to upload files</p>
                    <p class="text-xs text-gray-400 mt-1">PNG, JPG, PDF · max 5MB · up to 10 files</p>
                    <input #fileInput type="file" multiple accept=".png,.jpg,.jpeg,.pdf" class="hidden" (change)="onFiles($event)"/>
                  </div>
                }

                @for (a of attachments(); track a.id) {
                  <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    @if (isImage(a.fileType)) {
                      <img [src]="a.fileUrl" [alt]="a.fileName ?? 'Attachment'"
                        class="w-full max-h-56 object-contain bg-gray-50 border-b border-gray-100"/>
                    }
                    <div class="p-4 flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        [class]="a.fileType?.includes('pdf') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-800 truncate">{{ a.fileName ?? 'Attachment' }}</p>
                        <p class="text-xs text-gray-400 uppercase">{{ a.fileType ?? '' }}</p>
                      </div>
                      <div class="flex gap-3 items-center flex-shrink-0">
                        @if (auth.hasPermission(PERMISSIONS.UPDATE_ATTACHMENT)) {
                          <button (click)="replaceInput.click()" class="text-xs font-medium text-amber-600 hover:text-amber-800 transition-colors">Replace</button>
                          <input #replaceInput type="file" accept=".png,.jpg,.jpeg,.pdf" class="hidden" (change)="onReplaceFile($event, a)"/>
                        }
                        @if (auth.hasPermission(PERMISSIONS.DELETE_ATTACHMENT)) {
                          <button (click)="delAttachment(a)" class="text-xs font-medium text-red-500 hover:text-red-700 transition-colors">Delete</button>
                        }
                      </div>
                    </div>
                  </div>
                }

                @if (attachments().length === 0 && !auth.hasPermission(PERMISSIONS.CREATE_ATTACHMENT)) {
                  <div class="text-center py-10 text-gray-400 text-sm">No attachments</div>
                }
              </div>
            }

            <!-- Activity tab -->
            @if (activeTab() === 'activity') {
              <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                @if (!auth.hasPermission(PERMISSIONS.VIEW_AUDIT_LOG)) {
                  <div class="p-10 text-center text-gray-400 text-sm">
                    <svg class="w-8 h-8 mx-auto mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    VIEW_AUDIT_LOG permission required
                  </div>
                } @else {
                  <div class="divide-y divide-gray-50">
                    @for (a of activities(); track a.id) {
                      <div class="flex items-start gap-3 px-5 py-3.5">
                        <div class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {{ a.user?.firstName?.[0] ?? '?' }}
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm text-gray-700">{{ a.description }}</p>
                          <p class="text-xs text-gray-400 mt-0.5">{{ a.user?.firstName }} · {{ a.created_at | timeAgo }}</p>
                        </div>
                        <span class="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg font-mono flex-shrink-0">{{ a.action }}</span>
                      </div>
                    }
                    @if (activities().length === 0) {
                      <div class="p-10 text-center text-gray-400 text-sm">No activity yet</div>
                    }
                  </div>

                  <!-- Pagination -->
                  @if ((activityPagination()?.totalPages ?? 0) > 1) {
                    <div class="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <p class="text-xs text-gray-500">
                        Page <span class="font-semibold text-gray-700">{{ activityPagination()?.page }}</span>
                        of <span class="font-semibold text-gray-700">{{ activityPagination()?.totalPages }}</span>
                        · <span class="font-semibold text-gray-700">{{ activityPagination()?.totalRecords }}</span> activities
                      </p>
                      <div class="flex items-center gap-2">
                        <button (click)="changeActivityPage(-1)"
                          [disabled]="(activityPagination()?.page ?? 1) <= 1"
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm bg-white">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                          </svg>
                          Previous
                        </button>
                        <div class="flex items-center gap-1">
                          @for (pg of getActivityPageNumbers(); track pg) {
                            @if (pg === -1) {
                              <span class="px-1 text-gray-400 text-xs">…</span>
                            } @else {
                              <button (click)="goToActivityPage(pg)"
                                class="w-8 h-8 text-xs font-semibold rounded-lg transition-colors"
                                [class]="activityPagination()?.page === pg ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'">
                                {{ pg }}
                              </button>
                            }
                          }
                        </div>
                        <button (click)="changeActivityPage(1)"
                          [disabled]="(activityPagination()?.page ?? 1) >= (activityPagination()?.totalPages ?? 1)"
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm bg-white">
                          Next
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  }

                  <div class="p-4 text-center border-t border-gray-100 bg-gray-50/50">
                    <button (click)="exportActivity()" class="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 mx-auto">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                      Export activity log (Excel)
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>

    <app-confirm-dialog
      [open]="confirmDel"
      title="Delete task?"
      [message]="'Delete &quot;' + (task()?.title ?? '') + '&quot;? You can restore it later.'"
      confirmLabel="Delete"
      [destructive]="true"
      (confirm)="doDelete()"
      (cancel)="confirmDel = false"
    />
  `,
})
export class TaskDetailComponent implements OnInit {
  readonly PERMISSIONS = PERMISSIONS;
  task = signal<Task | null>(null);
  loading = signal(true);
  comments = signal<TaskComment[]>([]);
  commentPagination = signal<Pagination | null>(null);
  commentPage = 1;
  attachments = signal<TaskAttachment[]>([]);
  activities = signal<TaskActivity[]>([]);
  activityPagination = signal<Pagination | null>(null);
  activityPage = 1;
  activeTab = signal<Tab>('details');
  editingId = signal<number | null>(null);
  confirmDel = false;
  newComment = '';
  editText = '';

  computedTabs = computed(() => [
    { id: 'details' as Tab, label: 'Details', count: null },
    { id: 'comments' as Tab, label: 'Comments', count: this.commentPagination()?.totalRecords || null },
    { id: 'attachments' as Tab, label: 'Attachments', count: this.attachments().length || null },
    { id: 'activity' as Tab, label: 'Activity', count: this.activityPagination()?.totalRecords || null },
  ]);

  get currentUserId() { return this.auth.currentUser()!.id; }

  canStart = () =>
    (this.task()?.assignedTo === this.currentUserId || this.task()?.assignee?.id === this.currentUserId) &&
    this.task()?.status === 'TODO';
  canComplete = () =>
    (this.task()?.assignedTo === this.currentUserId || this.task()?.assignee?.id === this.currentUserId) &&
    this.task()?.status === 'IN_PROGRESS';
  canRestart = () =>
    (this.task()?.assignedTo === this.currentUserId || this.task()?.assignee?.id === this.currentUserId) &&
    this.task()?.status === 'REJECTED';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    public auth: AuthService,
    private taskSvc: TaskService,
    private commentSvc: TaskCommentService,
    private attSvc: TaskAttachmentService,
    private actSvc: TaskActivityService,
    private dash: DashboardService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((p) => {
      const id = Number(p.get('id'));
      if (id) this.loadTask(id);
    });
  }

  goBack() { this.location.back(); }

  loadTask(id: number) {
    this.loading.set(true);
    this.taskSvc.getTaskById(id).subscribe({
      next: (r) => {
        this.task.set(r.data);
        this.loading.set(false);
        this.commentPage = 1;
        this.loadComments(id);
        this.loadAttachments(id);
        this.activityPage = 1;
        if (this.auth.hasPermission(PERMISSIONS.VIEW_AUDIT_LOG)) this.loadActivity(id);
      },
      error: () => this.loading.set(false),
    });
  }
  loadComments(id: number) {
    this.commentSvc.getComments(id, { page: this.commentPage, limit: 7 }).subscribe({
      next: (r) => {
        const list = Array.isArray(r?.data)
          ? r.data
          : Array.isArray((r?.data as any)?.comments)
            ? (r.data as any).comments
            : [];
        this.comments.set(list);
        this.commentPagination.set((r?.data as any)?.pagination ?? null);
      }
    });
  }
  changeCommentPage(d: number) {
    const t = this.task();
    if (!t) return;
    this.commentPage += d;
    this.loadComments(t.id);
  }
  goToCommentPage(pg: number) {
    const t = this.task();
    if (!t) return;
    this.commentPage = pg;
    this.loadComments(t.id);
  }
  getCommentPageNumbers(): number[] {
    const total = this.commentPagination()?.totalPages ?? 1;
    const current = this.commentPagination()?.page ?? 1;
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
  loadAttachments(id: number) { this.attSvc.getAttachments(id).subscribe({ next: (r) => this.attachments.set(r.data) }); }
  loadActivity(id: number) {
    this.actSvc.getTaskActivity(id, { page: this.activityPage, limit: 7 }).subscribe({
      next: (r) => {
        const list = Array.isArray(r?.data)
          ? r.data
          : Array.isArray((r?.data as any)?.activities)
            ? (r.data as any).activities
            : [];
        this.activities.set(list);
        this.activityPagination.set((r?.data as any)?.pagination ?? null);
      }
    });
  }
  changeActivityPage(d: number) {
    const t = this.task();
    if (!t) return;
    this.activityPage += d;
    this.loadActivity(t.id);
  }
  goToActivityPage(pg: number) {
    const t = this.task();
    if (!t) return;
    this.activityPage = pg;
    this.loadActivity(t.id);
  }
  getActivityPageNumbers(): number[] {
    const total = this.activityPagination()?.totalPages ?? 1;
    const current = this.activityPagination()?.page ?? 1;
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
  updateStatus(s: TaskStatus) {
    const t = this.task(); if (!t) return;
    this.taskSvc.updateTaskStatus(t.id, { status: s }).subscribe({ next: (r) => this.task.set(r.data) });
  }
  doDelete() {
    const t = this.task(); if (!t) return;
    this.confirmDel = false;
    this.taskSvc.deleteTask(t.id).subscribe({ next: () => this.router.navigate(['/tasks']) });
  }
  doRestore() {
    const t = this.task(); if (!t) return;
    this.taskSvc.restoreTask(t.id).subscribe({ next: (r) => this.task.set(r.data) });
  }
  startEdit(c: TaskComment) { this.editingId.set(c.id); this.editText = c.message; }
  saveEdit(c: TaskComment) {
    this.commentSvc.updateComment(c.id, this.editText.trim()).subscribe({
      next: (r) => { this.comments.update((l) => l.map((x) => (x.id === r.data.id ? r.data : x))); this.editingId.set(null); },
    });
  }
  delComment(c: TaskComment) {
    this.commentSvc.deleteComment(c.id).subscribe({
      next: () => {
        const t = this.task();
        if (t) {
          const currentCount = this.comments().length;
          if (currentCount === 1 && this.commentPage > 1) {
            this.commentPage--;
          }
          this.loadComments(t.id);
        }
      }
    });
  }
  postComment() {
    const t = this.task(); if (!t || !this.newComment.trim()) return;
    this.commentSvc.createComment(t.id, this.newComment.trim()).subscribe({
      next: () => {
        this.newComment = '';
        this.loadComments(t.id);
      },
    });
  }
  isImage(fileType: string | null | undefined): boolean { return !!fileType && fileType.startsWith('image/'); }
  onReplaceFile(e: Event, attachment: TaskAttachment) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file || !this.task()) return;
    this.attSvc.updateAttachment(attachment.id, file).subscribe({ complete: () => this.loadAttachments(this.task()!.id) });
  }
  onFiles(e: Event) {
    const f = Array.from((e.target as HTMLInputElement).files ?? []);
    if (!f.length || !this.task()) return;
    this.attSvc.uploadAttachments(this.task()!.id, f).subscribe({ complete: () => this.loadAttachments(this.task()!.id) });
  }
  delAttachment(a: TaskAttachment) {
    this.attSvc.deleteAttachment(a.id).subscribe({ next: () => this.attachments.update((l) => l.filter((x) => x.id !== a.id)) });
  }
  exportActivity() { if (this.task()) this.dash.exportTaskActivity(this.task()!.id); }
}