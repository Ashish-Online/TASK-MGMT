import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { PERMISSIONS } from './core/constants/permissions.constant';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login',    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'tasks',        loadComponent: () => import('./features/tasks/task-list/task-list.component').then(m => m.TaskListComponent),       canActivate: [permissionGuard(PERMISSIONS.VIEW_TASKS)] },
      { path: 'tasks/:id',    loadComponent: () => import('./features/tasks/task-detail/task-detail.component').then(m => m.TaskDetailComponent), canActivate: [permissionGuard(PERMISSIONS.VIEW_TASKS)] },
      { path: 'review-queue', loadComponent: () => import('./features/tasks/review-queue/review-queue.component').then(m => m.ReviewQueueComponent), canActivate: [permissionGuard(PERMISSIONS.APPROVE_TASK)] },
      { path: 'users',        loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent),       canActivate: [permissionGuard(PERMISSIONS.VIEW_USERS)] },
      { path: 'users/:id',    loadComponent: () => import('./features/users/user-detail/user-detail.component').then(m => m.UserDetailComponent), canActivate: [permissionGuard(PERMISSIONS.VIEW_USERS)] },
      { path: 'roles',        loadComponent: () => import('./features/roles/role-list/role-list.component').then(m => m.RoleListComponent),       canActivate: [permissionGuard(PERMISSIONS.VIEW_ROLES)] },
      { path: 'roles/:id',    loadComponent: () => import('./features/roles/role-detail/role-detail.component').then(m => m.RoleDetailComponent), canActivate: [permissionGuard(PERMISSIONS.VIEW_ROLES)] },
      { path: 'notifications',loadComponent: () => import('./features/notifications/notification-list.component').then(m => m.NotificationListComponent), canActivate: [permissionGuard(PERMISSIONS.NOTIFICATION_VIEW)] },
      { path: 'my-tasks',     loadComponent: () => import('./features/tasks/my-tasks/my-tasks.component').then(m => m.MyTasksComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
