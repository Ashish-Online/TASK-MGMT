import { Pagination } from './user.model';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'REJECTED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export interface TaskUser { id: number; firstName: string; lastName: string | null; email: string; }
export interface Task { id: number; organizationId: number; title: string; description: string | null; status: TaskStatus; priority: TaskPriority; assignedTo: number | null; createdBy: number; dueDate: string | null; reviewerId: number | null; reviewReason: string | null; slaHours: number | null; isDelayed: boolean; isActive: boolean; created_at: string; updated_at: string; assignee?: TaskUser | null; reviewer?: TaskUser | null; creator?: TaskUser; }
export interface CreateTaskRequest { title: string; description?: string; priority?: TaskPriority; assignedTo?: number; reviewerId?: number; dueDate?: string; }
export interface UpdateTaskRequest { title?: string; description?: string; priority?: TaskPriority; dueDate?: string; reviewerId?: number | null; }
export interface UpdateTaskStatusRequest { status: TaskStatus; reviewReason?: string; }
export interface AssignTaskRequest { assignedTo: number | null; }
export interface TasksResponse { tasks: Task[]; pagination: Pagination; }
export interface TaskFilters { page?: number; limit?: number; status?: TaskStatus; priority?: TaskPriority; assignedTo?: number; reviewerId?: number; startDate?: string; endDate?: string; isActive?: boolean; search?: string; }
