export interface LoginRequest { email: string; password: string; }
export interface RegisterOrgRequest { organizationName: string; adminName: string; email: string; password: string; }
export interface AuthResponse { accessToken: string; user: CurrentUser; }
export interface CurrentUser { id: number; firstName: string; lastName: string | null; email: string; isActive: boolean; role: UserRole; organization: Organization; }
export interface UserRole { id: number; name: string; permissions: Permission[]; }
export interface Organization { id: number; name: string; slug: string; }
export interface Permission { id: number; name: string; code: string; }
