import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { Role } from '../../../core/models/role.model';
import { PERMISSIONS } from '../../../core/constants/permissions.constant';
import { ErrorBannerComponent } from '../../../shared';

@Component({
  selector: 'app-user-detail', standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ErrorBannerComponent],
  template: `
    <div class="p-6 max-w-2xl mx-auto">

      <!-- Back button -->
      <button (click)="goBack()"
        class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 group transition-colors">
        <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to users
      </button>

      @if (loading()) {
        <div class="animate-pulse space-y-4">
          <div class="flex items-start gap-4 bg-white rounded-2xl p-6 border border-gray-200">
            <div class="w-16 h-16 bg-gray-200 rounded-2xl"></div>
            <div class="flex-1 space-y-2 pt-1">
              <div class="h-5 bg-gray-200 rounded w-40"></div>
              <div class="h-4 bg-gray-200 rounded w-56"></div>
              <div class="h-5 bg-gray-200 rounded w-20 mt-2"></div>
            </div>
          </div>
          <div class="h-44 bg-gray-200 rounded-2xl"></div>
          <div class="h-28 bg-gray-200 rounded-2xl"></div>
        </div>
      } @else if (!user()) {
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <p class="text-sm font-semibold text-gray-700">User not found</p>
          <button (click)="goBack()" class="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium">Go back</button>
        </div>
      } @else {

        <!-- User header card -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-5">
          <div class="flex items-start gap-5">
            <div class="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold flex-shrink-0">
              {{ initials() }}
            </div>
            <div class="flex-1 min-w-0">
              <h1 class="text-xl font-bold text-gray-900">{{ user()!.firstName }} {{ user()!.lastName ?? '' }}</h1>
              <p class="text-sm text-gray-500 mt-0.5">{{ user()!.email }}</p>
              <div class="flex items-center gap-2 mt-2.5 flex-wrap">
                <span class="text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-lg font-semibold">{{ user()!.role?.name ?? '—' }}</span>
                <span class="text-xs px-2.5 py-1 rounded-lg font-semibold"
                  [class]="user()!.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'">
                  {{ user()!.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        @if (auth.hasPermission(PERMISSIONS.UPDATE_USER)) {
          <!-- Edit Profile -->
          <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-5">
            <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 class="text-sm font-bold text-gray-800">Edit Profile</h2>
              <p class="text-xs text-gray-500 mt-0.5">Update the user's name and email</p>
            </div>
            <form [formGroup]="editForm" (ngSubmit)="saveProfile()" class="px-6 py-5">
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">First Name <span class="text-red-500">*</span></label>
                  <input formControlName="firstName" class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">Last Name</label>
                  <input formControlName="lastName" class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
              </div>
              <div class="mb-5">
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">Email <span class="text-red-500">*</span></label>
                <input formControlName="email" type="email" class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <app-error-banner [message]="profileError()" (dismiss)="profileError.set(null)"/>
              @if (profileSuccess()) {
                <div class="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-sm">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  Profile updated successfully.
                </div>
              }
              <button type="submit" [disabled]="saving()"
                class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                @if (saving()) {
                  <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Saving…
                } @else { Save Changes }
              </button>
            </form>
          </div>

          <!-- Change Role -->
          <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-5">
            <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 class="text-sm font-bold text-gray-800">Change Role</h2>
              <p class="text-xs text-gray-500 mt-0.5">Assign a different role to this user</p>
            </div>
            <div class="px-6 py-5">
              <div class="flex gap-3">
                <select [(ngModel)]="selectedRoleId"
                  class="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  @for (r of roles(); track r.id) { @if (r.isActive) { <option [ngValue]="r.id">{{ r.name }}</option> } }
                </select>
                <button (click)="changeRole()" [disabled]="changingRole() || !selectedRoleId || selectedRoleId === user()!.roleId"
                  class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors">
                  @if (changingRole()) { <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Updating… }
                  @else { Change Role }
                </button>
              </div>
              @if (roleError()) { <p class="mt-2 text-xs text-red-600">{{ roleError() }}</p> }
              @if (roleSuccess()) { <p class="mt-2 text-xs text-emerald-600">Role updated successfully.</p> }
            </div>
          </div>
        }

        <!-- Danger Zone -->
        @if (auth.hasPermission(PERMISSIONS.DELETE_USER)) {
          <div class="bg-white border border-red-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-red-100 bg-red-50/40">
              <h2 class="text-sm font-bold text-red-700">Danger Zone</h2>
            </div>
            <div class="px-6 py-5 flex items-center justify-between gap-4">
              @if (user()!.isActive) {
                <div>
                  <p class="text-sm font-semibold text-gray-800">Deactivate user</p>
                  <p class="text-xs text-gray-500 mt-0.5">User must have no active assigned tasks</p>
                </div>
                <button (click)="doDelete()" class="flex-shrink-0 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors">Deactivate</button>
              } @else {
                <div>
                  <p class="text-sm font-semibold text-gray-800">Restore user</p>
                  <p class="text-xs text-gray-500 mt-0.5">User's role must be active</p>
                </div>
                <button (click)="doRestore()" class="flex-shrink-0 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">Restore</button>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class UserDetailComponent implements OnInit {
  readonly PERMISSIONS = PERMISSIONS;
  user = signal<User|null>(null); roles = signal<Role[]>([]); loading = signal(true);
  saving = signal(false); profileError = signal<string|null>(null); profileSuccess = signal(false);
  roleError = signal<string|null>(null); roleSuccess = signal(false); changingRole = signal(false);
  selectedRoleId: number|null = null;
  editForm: FormGroup;
  readonly initials = computed(() => { const u=this.user(); return u?(u.firstName[0]+(u.lastName?.[0]??'')).toUpperCase():'?'; });
  constructor(private route: ActivatedRoute, private router: Router, private location: Location, public auth: AuthService, private userSvc: UserService, private roleSvc: RoleService, private fb: FormBuilder) {
    this.editForm = this.fb.group({ firstName:['',Validators.required], lastName:[''], email:['', [Validators.required,Validators.email]] });
  }
  ngOnInit() {
    this.roleSvc.getRoles().subscribe({ next: r => { const list = Array.isArray(r?.data)?r.data:Array.isArray((r?.data as any)?.roles)?(r.data as any).roles:[]; this.roles.set(list); } });
    this.route.paramMap.subscribe(p => { const id=Number(p.get('id')); if(id) this.loadUser(id); });
  }
  goBack() { this.location.back(); }
  loadUser(id: number) {
    this.loading.set(true);
    this.userSvc.getUserById(id).subscribe({ next: r => { this.user.set(r.data); this.editForm.patchValue({firstName:r.data.firstName,lastName:r.data.lastName??'',email:r.data.email}); this.selectedRoleId=r.data.roleId!=null?Number(r.data.roleId):null; this.loading.set(false); }, error:()=>this.loading.set(false) });
  }
  saveProfile() {
    if(this.editForm.invalid){this.editForm.markAllAsTouched();return;}
    const u=this.user();if(!u)return;
    this.saving.set(true);this.profileError.set(null);this.profileSuccess.set(false);
    this.userSvc.updateUser(u.id,this.editForm.value).subscribe({ next:r=>{this.user.update(o=>o?{...o,...r.data}:o);this.profileSuccess.set(true);this.saving.set(false);}, error:(e:any)=>{this.profileError.set(e?.error?.message??e?.message??'Failed to update');this.saving.set(false);} });
  }
  changeRole() {
    const u=this.user();if(!u||this.selectedRoleId==null)return;
    this.roleError.set(null);this.roleSuccess.set(false);this.changingRole.set(true);
    this.userSvc.changeRole(u.id,{roleId:this.selectedRoleId}).subscribe({ next:r=>{this.user.update(o=>o?{...o,roleId:r.data.roleId,role:r.data.role}:o);this.roleSuccess.set(true);this.changingRole.set(false);}, error:(e:any)=>{this.roleError.set(e?.error?.message??e?.message??'Failed to change role');this.changingRole.set(false);} });
  }
  doDelete(){const u=this.user();if(!u||!confirm(`Deactivate ${u.firstName}?`))return;this.userSvc.deleteUser(u.id).subscribe({next:()=>this.router.navigate(['/users'])});}
  doRestore(){const u=this.user();if(!u)return;this.userSvc.restoreUser(u.id).subscribe({next:()=>this.user.update(o=>o?{...o,isActive:true}:o)});}
}