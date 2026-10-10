import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Project,
  ProjectFilters,
  ProjectsResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../models/project.model';
import { TasksResponse, TaskFilters } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly api = `${environment.apiUrl}/project`;

  constructor(private http: HttpClient) {}

  getProjects(f: ProjectFilters = {}): Observable<{ success: boolean; data: ProjectsResponse }> {
    let params = new HttpParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<{ success: boolean; data: ProjectsResponse }>(this.api, { params });
  }

  getProjectById(id: number): Observable<{ success: boolean; data: Project }> {
    return this.http.get<{ success: boolean; data: Project }>(`${this.api}/${id}`);
  }

  createProject(body: CreateProjectRequest): Observable<{ success: boolean; message: string; data: Project }> {
    return this.http.post<{ success: boolean; message: string; data: Project }>(this.api, body);
  }

  updateProject(id: number, body: UpdateProjectRequest): Observable<{ success: boolean; message: string; data: Project }> {
    return this.http.patch<{ success: boolean; message: string; data: Project }>(`${this.api}/${id}`, body);
  }

  deleteProject(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.api}/${id}`);
  }

  getProjectTasks(id: number, f: TaskFilters = {}): Observable<{ success: boolean; data: TasksResponse }> {
    let params = new HttpParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<{ success: boolean; data: TasksResponse }>(`${this.api}/${id}/tasks`, { params });
  }
}
