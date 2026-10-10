import { Permission } from './auth.model';
export interface Role { id: number; name: string; description: string | null; isActive: boolean; organizationId: number; created_at: string; permissions?: Permission[]; }
export interface CreateRoleRequest { name: string; description?: string; }
export interface UpdateRoleRequest { name?: string; description?: string; }
export interface AssignPermissionsRequest { permissionIds: number[]; }
