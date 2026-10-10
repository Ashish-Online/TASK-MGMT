import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task, TaskFilters, TasksResponse, CreateTaskRequest, UpdateTaskRequest, UpdateTaskStatusRequest, AssignTaskRequest } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly api = `${environment.apiUrl}/task`;
  constructor(private http: HttpClient) {}
  getTasks(f: TaskFilters = {}): Observable<{ success: boolean; data: TasksResponse }> {
    let params = new HttpParams();
    Object.entries(f).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v)); });
    return this.http.get<{ success: boolean; data: TasksResponse }>(this.api, { params });
  }
  getTaskById(id: number): Observable<{ success: boolean; data: Task }> { return this.http.get<{ success: boolean; data: Task }>(`${this.api}/${id}`); }
  createTask(body: CreateTaskRequest): Observable<{ success: boolean; data: Task }> { return this.http.post<{ success: boolean; data: Task }>(this.api, body); }
  updateTask(id: number, body: UpdateTaskRequest): Observable<{ success: boolean; data: Task }> { return this.http.patch<{ success: boolean; data: Task }>(`${this.api}/${id}`, body); }
  updateTaskStatus(id: number, body: UpdateTaskStatusRequest): Observable<{ success: boolean; data: Task }> { return this.http.patch<{ success: boolean; data: Task }>(`${this.api}/${id}/status`, body); }
  assignTask(id: number, body: AssignTaskRequest): Observable<{ success: boolean; data: Task }> { return this.http.patch<{ success: boolean; data: Task }>(`${this.api}/${id}/assign`, body); }
  deleteTask(id: number): Observable<{ success: boolean }> { return this.http.delete<{ success: boolean }>(`${this.api}/${id}/delete`); }
  restoreTask(id: number): Observable<{ success: boolean; data: Task }> { return this.http.patch<{ success: boolean; data: Task }>(`${this.api}/${id}/restore`, {}); }
  getReviewQueue(f: TaskFilters = {}): Observable<{ success: boolean; data: TasksResponse }> {
    let params = new HttpParams();
    Object.entries(f).forEach(([k, v]) => { if (v !== undefined) params = params.set(k, String(v)); });
    return this.http.get<{ success: boolean; data: TasksResponse }>(`${this.api}/review-queue`, { params });
  }
}
