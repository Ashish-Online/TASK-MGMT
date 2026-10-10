import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../../core/services/role.service';
import { PermissionService } from '../../../core/services/permission.service';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/role.model';
import { Permission } from '../../../core/models/auth.model';
import { PERMISSIONS } from '../../../core/constants/permissions.constant';
import { LoadingSpinnerComponent, ErrorBannerComponent } from '../../../shared';

const GROUPS = [
  { label: 'User Management',     codes: ['CREATE_USER','UPDATE_USER','DELETE_USER','VIEW_USERS'] },
  { label: 'Role Management',     codes: ['CREATE_ROLE','UPDATE_ROLE','DELETE_ROLE','VIEW_ROLES','VIEW_PERMISSIONS'] },
  { label: 'Task Management',     codes: ['CREATE_TASK','UPDATE_TASK','EDIT_OWN_TASK','EDIT_ALL_TASKS','DELETE_TASK','VIEW_TASKS','VIEW_ALL_TASKS','ASSIGN_TASK','APPROVE_TASK','RESTORE_TASK'] },
  { label: 'Comments',            codes: ['CREATE_COMMENT','UPDATE_COMMENT','DELETE_COMMENT'] },
  // NEW: Attachment permissions added — matches the auth middleware now
  // enforced on POST /:taskId/attachments and DELETE /:attachmentId.
  { label: 'Attachments',         codes: ['CREATE_ATTACHMENT','UPDATE_ATTACHMENT','DELETE_ATTACHMENT'] },
  { label: 'Notifications',       codes: ['NOTIFICATION_VIEW'] },
  { label: 'Audit & Org',         codes: ['VIEW_AUDIT_LOG','UPDATE_ORGANIZATION'] },
];

@Component({
  selector: 'app-role-detail', standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorBannerComponent],
  template: `
    <div class="p-6 max-w-3xl mx-auto">
      @if (loading()) { <app-loading-spinner [padding]="64"/> }
      @else if (!role()) { <div class="text-center py-16 text-slate-500 text-sm">Role not found</div> }
      @else {
        <div class="mb-6">
          <h1 class="text-xl font-semibold text-slate-900">{{ role()!.name }}</h1>
          @if (role()!.description) { <p class="text-slate-500 text-sm mt-1">{{ role()!.description }}</p> }
          <div class="flex gap-2 mt-2">
            <span class="text-xs px-2 py-0.5 rounded-md font-medium" [class]="role()!.isActive?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-500'">{{ role()!.isActive?'Active':'Inactive' }}</span>
            <span class="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-md font-medium">{{ selectedIds().size }} / {{ allPermissions().length }} permissions</span>
          </div>
        </div>
        @if (auth.hasPermission(PERMISSIONS.UPDATE_ROLE)) {
          <div class="space-y-4 mb-6">
            @for (group of groups; track group.label) {
              <div class="bg-white border border-slate-200 rounded-xl p-4">
                <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{{ group.label }}</h3>
                <div class="grid grid-cols-2 gap-2">
                  @for (code of group.codes; track code) {
                    @if (getPermByCode(code); as perm) {
                      <label class="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                        <input type="checkbox" [checked]="selectedIds().has(perm.id)" (change)="toggle(perm.id)" [disabled]="role()!.name==='ADMIN'" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                        <span class="text-xs font-mono text-slate-700">{{ code }}</span>
                      </label>
                    }
                  }
                </div>
              </div>
            }
          </div>
          @if (role()!.name === 'ADMIN') {
            <div class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">Admin role permissions cannot be modified.</div>
          }
          <app-error-banner [message]="saveError()" (dismiss)="saveError.set(null)"/>
          @if (saveSuccess()) { <div class="mb-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">Permissions saved.</div> }
          <div class="flex gap-3 mt-4">
            <button (click)="save()" [disabled]="saving()||role()!.name==='ADMIN'"
              class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
              @if (saving()) { <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> }
              Save Permissions
            </button>
            <button (click)="selectAll()" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50">Select All</button>
            <button (click)="clearAll()"  class="px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50">Clear All</button>
          </div>
        }
      }
    </div>
  `,
})
export class RoleDetailComponent implements OnInit {
  readonly PERMISSIONS = PERMISSIONS; readonly groups = GROUPS;
  role = signal<Role|null>(null); allPermissions = signal<Permission[]>([]);
  selectedIds = signal<Set<number>>(new Set()); loading = signal(true);
  saving = signal(false); saveError = signal<string|null>(null); saveSuccess = signal(false);
  constructor(private route: ActivatedRoute, public auth: AuthService, private roleSvc: RoleService, private permSvc: PermissionService) {}
  ngOnInit() {
    this.permSvc.getPermissions().subscribe({ next: r => {
      this.allPermissions.set(r.data);
      this.route.paramMap.subscribe(p => { const id=Number(p.get('id')); if(id) this.loadRole(id); });
    }});
  }
  loadRole(id: number) {
    this.loading.set(true);
    this.roleSvc.getRoleById(id).subscribe({ next: r => {
      this.role.set(r.data);
      this.selectedIds.set(new Set(r.data.permissions?.map(p=>p.id)??[]));
      this.loading.set(false);
    }, error: ()=>this.loading.set(false) });
  }
  getPermByCode(code: string) { return this.allPermissions().find(p=>p.code===code); }
  toggle(id: number) { this.selectedIds.update(s => { const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; }); }
  selectAll() { this.selectedIds.set(new Set(this.allPermissions().map(p=>p.id))); }
  clearAll()  { this.selectedIds.set(new Set()); }
  save() {
    const r=this.role(); if(!r) return;
    this.saving.set(true); this.saveError.set(null); this.saveSuccess.set(false);
    this.roleSvc.assignPermissions(r.id, { permissionIds: Array.from(this.selectedIds()) }).subscribe({
      next: () => { this.saveSuccess.set(true); this.saving.set(false); },
      error: (e:Error) => { this.saveError.set(e.message); this.saving.set(false); },
    });
  }
}