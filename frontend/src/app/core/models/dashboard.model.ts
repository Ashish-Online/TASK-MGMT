export interface DashboardOverview {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingReviewTasks: number;
  rejectedTasks: number;
  totalUsers: number;           
  totalRoles: number;           
  totalPermissions: number;         
  unreadNotifications: number;  
}
export interface RecentTask {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee?: { id: number; firstName: string; lastName: string | null };
}
export interface ActivityItem {
  id: number;
  action: string;
  description: string;
  created_at: string;
  task?: { id: number; title: string };
  user?: { id: number; firstName: string; lastName: string | null };
}
export interface TaskStatusChart {
  TODO: number;
  IN_PROGRESS: number;
  COMPLETED: number;
  APPROVED: number;
  REJECTED: number;
}
export interface ProductivityData {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  productivityPercentage: number;
}
export interface TeamPerformance {
  userId: number;
  firstName: string;
  lastName: string | null;
  totalTasks: number;
  completedTasks: number;
  approvedTasks: number;
  rejectedTasks: number;
  productivityPercentage: number;
}
export interface PendingReviews {
  count: number;
  tasks: RecentTask[];
}
export interface OverdueTasks {
  count: number;
  tasks: RecentTask[];
}
export interface TaskPriorityChart {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  CRITICAL: number;
}
export interface MonthlyTrend {
  month: string;
  count: number;
}
export interface TopPerformer {
  userId: number;
  firstName: string;
  lastName: string | null;
  completedTasks: number;
  productivityPercentage: number;
}
