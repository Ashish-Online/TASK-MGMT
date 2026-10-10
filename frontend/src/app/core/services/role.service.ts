import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
} from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly api = `${environment.apiUrl}/role`;
  constructor(private http: HttpClient) {}
  getRoles(params?: any): Observable<{ success: boolean; data: any }> {
    return this.http.get<any>(this.api, { params });
  }
  getRoleById(id: number): Observable<{ success: boolean; data: Role }> {
    return this.http.get<{ success: boolean; data: Role }>(`${this.api}/${id}`);
  }
  createRole(body: CreateRoleRequest): Observable<{ success: boolean; data: Role }> {
    return this.http.post<{ success: boolean; data: Role }>(this.api, body);
  }
  updateRole(id: number, body: UpdateRoleRequest): Observable<{ success: boolean; data: Role }> {
    return this.http.patch<{ success: boolean; data: Role }>(`${this.api}/${id}`, body);
  }
  deleteRole(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.api}/${id}`);
  }
  restoreRole(id: number): Observable<{ success: boolean; data: Role }> {
    return this.http.patch<{ success: boolean; data: Role }>(`${this.api}/${id}/restore`, {});
  }
  assignPermissions(
    id: number,
    body: AssignPermissionsRequest,
  ): Observable<{ success: boolean; data: Role }> {
    return this.http.put<{ success: boolean; data: Role }>(`${this.api}/${id}/permissions`, body);
  }
}
