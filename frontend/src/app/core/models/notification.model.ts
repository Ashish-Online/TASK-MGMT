import { Pagination } from './user.model';
export type NotificationType = 'TASK_ASSIGNED' | 'TASK_REASSIGNED' | 'TASK_UNASSIGNED' | 'TASK_REVIEW_ASSIGNED' | 'TASK_READY_FOR_REVIEW' | 'TASK_APPROVED' | 'TASK_REJECTED' | 'TASK_DELETED' | 'TASK_RESTORED' | 'TASK_COMMENT' | 'COMMENT_UPDATED' | 'COMMENT_DELETED' | 'TASK_DUE_REMINDER' | 'TASK_REMINDER';
export interface Notification { id: number; userId: number; organizationId: number; title: string; message: string; type: NotificationType; isRead: boolean; created_at: string; }
export interface NotificationsResponse { notifications: Notification[]; pagination: Pagination; }
