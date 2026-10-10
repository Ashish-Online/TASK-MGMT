import { Pagination } from './user.model';
export interface TaskActivity { id: number; taskId: number; organizationId: number; userId: number; action: string; description: string; oldValue: string | null; newValue: string | null; created_at: string; user?: { id: number; firstName: string; lastName: string | null; email: string }; task?: { id: number; title: string }; }
