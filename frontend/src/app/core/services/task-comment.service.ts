import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TaskComment } from '../models/task-comment.model';

@Injectable({ providedIn: 'root' })
export class TaskCommentService {
  private readonly base = `${environment.apiUrl}/taskComment`;
  constructor(private http: HttpClient) {}
  getComments(taskId: number, params?: any): Observable<{ success: boolean; data: any }> { return this.http.get<any>(`${this.base}/tasks/${taskId}/comments`, { params }); }
  createComment(taskId: number, message: string): Observable<{ success: boolean; data: TaskComment }> { return this.http.post<{ success: boolean; data: TaskComment }>(`${this.base}/tasks/${taskId}/comments`, { message }); }
  updateComment(id: number, message: string): Observable<{ success: boolean; data: TaskComment }> { return this.http.patch<{ success: boolean; data: TaskComment }>(`${this.base}/comments/${id}`, { message }); }
  deleteComment(id: number): Observable<{ success: boolean }> { return this.http.delete<{ success: boolean }>(`${this.base}/comments/${id}`); }
}
