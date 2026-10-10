import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DashboardOverview,
  RecentTask,
  ActivityItem,
  TaskStatusChart,
  ProductivityData,
  TeamPerformance,
  PendingReviews,
  OverdueTasks,
  TaskPriorityChart,
  MonthlyTrend,
  TopPerformer,
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = `${environment.apiUrl}/dashboard`;
  constructor(private http: HttpClient) {}
  getOverview(): Observable<{ success: boolean; data: DashboardOverview }> {
    return this.http.get<any>(`${this.api}/overview`);
  }
  getRecentTasks(): Observable<{ success: boolean; data: RecentTask[] }> {
    return this.http.get<any>(`${this.api}/recent-tasks`);
  }
  getRecentActivities(): Observable<{ success: boolean; data: ActivityItem[] }> {
    return this.http.get<any>(`${this.api}/recent-activities`);
  }
  getTaskStatusChart(): Observable<{ success: boolean; data: TaskStatusChart }> {
    return this.http.get<any>(`${this.api}/task-status-chart`);
  }
  getProductivity(): Observable<{ success: boolean; data: ProductivityData }> {
    return this.http.get<any>(`${this.api}/productivity`);
  }
  getTeamPerformance(): Observable<{ success: boolean; data: TeamPerformance[] }> {
    return this.http.get<any>(`${this.api}/team-performance`);
  }
  getPendingReviews(): Observable<{ success: boolean; data: PendingReviews }> {
    return this.http.get<any>(`${this.api}/pending-reviews`);
  }
  getOverdueTasks(): Observable<{ success: boolean; data: OverdueTasks }> {
    return this.http.get<any>(`${this.api}/overdue-tasks`);
  }
  getTaskPriorityChart(): Observable<{ success: boolean; data: TaskPriorityChart }> {
    return this.http.get<any>(`${this.api}/task-priority-chart`);
  }
  // getMonthlyTrend(): Observable<{ success: boolean; data: MonthlyTrend[] }> {
  //   return this.http.get<any>(`${this.api}/monthly-task-trend`);
  // }
  getMonthlyTrend(): Observable<{ success: boolean; data: MonthlyTrend[] }> {
    return this.http.get<any>(`${this.api}/monthly-task-trend`);
  }
  getTopPerformers(): Observable<{ success: boolean; data: TopPerformer[] }> {
    return this.http.get<any>(`${this.api}/top-performers`);
  }

  exportReport(): void {
    this.http
      .get(`${this.api}/export-report`, {
        responseType: 'blob',
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');

          a.href = url;
          a.download = 'dashboard-report.xlsx';

          a.click();

          window.URL.revokeObjectURL(url);
        },

        error: (err) => {
          console.error('Failed to export report', err);
        },
      });
  }

  exportTaskActivity(taskId: number): void {
    this.http
      .get(`${this.api}/${taskId}/activity/export`, {
        responseType: 'blob',
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');

          a.href = url;

          a.download = `task-${taskId}-activity.xlsx`;

          a.click();

          window.URL.revokeObjectURL(url);
        },

        error: (err) => {
          console.error('Failed to export task activity', err);
        },
      });
  }
}
