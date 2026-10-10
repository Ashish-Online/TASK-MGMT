export interface User { id: number; firstName: string; lastName: string | null; email: string; isActive: boolean; roleId: number; organizationId: number; lastLoginAt: string | null; created_at: string; role?: { id: number; name: string }; }
export interface CreateUserRequest { firstName: string; lastName?: string; email: string; password: string; roleId: number; }
export interface UpdateUserRequest { firstName?: string; lastName?: string; email?: string; }
export interface ChangeRoleRequest { roleId: number; }
export interface UsersResponse { users: User[]; pagination: Pagination; }
export interface Pagination { page: number; limit: number; totalRecords: number; totalPages: number; }
