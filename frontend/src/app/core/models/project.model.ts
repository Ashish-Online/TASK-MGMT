import { Pagination } from './user.model';
import { Task } from './task.model';

export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ProjectStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  rejected?: number;
}

export interface ProjectCreator {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
}

export interface Project {
  id: number;
  organizationId: number;
  name: string;
  key: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string | null;
  endDate: string | null;
  createdBy: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  creator?: ProjectCreator;
  tasks?: Task[];
  taskStats?: ProjectStats;
  progress?: number;
}

export interface CreateProjectRequest {
  name: string;
  key?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UpdateProjectRequest {
  name?: string;
  key?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: Pagination;
}

export interface ProjectFilters {
  page?: number;
  limit?: number;
  status?: ProjectStatus | '';
  priority?: ProjectPriority | '';
  search?: string;
  isActive?: boolean | string;
}
