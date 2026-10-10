import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TaskActivity } from '../models/task-activity.model';

@Injectable({ providedIn: 'root' })
export class TaskActivityService {
  private readonly base = `${environment.apiUrl}/taskActivity`;
  constructor(private http: HttpClient) {}
  getTaskActivity(taskId: number, params?: any): Observable<{ success: boolean; data: any }> { return this.http.get<any>(`${this.base}/${taskId}/activity`, { params }); }
  getGlobalActivity(): Observable<{ success: boolean; data: any }> { return this.http.get<any>(`${this.base}/activity`); }
}
