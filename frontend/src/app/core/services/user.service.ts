import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ChangeRoleRequest,
  UsersResponse,
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = `${environment.apiUrl}/user`;
  constructor(private http: HttpClient) {}
  getUsers(p: Record<string, unknown> = {}): Observable<{ success: boolean; data: UsersResponse }> {
    let params = new HttpParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v !== undefined) params = params.set(k, String(v));
    });
    return this.http.get<{ success: boolean; data: UsersResponse }>(this.api, { params });
  }
  getUserById(id: number): Observable<{ success: boolean; data: User }> {
    return this.http.get<{ success: boolean; data: User }>(`${this.api}/${id}`);
  }
  createUser(body: CreateUserRequest): Observable<{ success: boolean; data: User }> {
    return this.http.post<{ success: boolean; data: User }>(this.api, body);
  }
  updateUser(id: number, body: UpdateUserRequest): Observable<{ success: boolean; data: User }> {
    return this.http.patch<{ success: boolean; data: User }>(`${this.api}/${id}`, body);
  }
  changeRole(id: number, body: ChangeRoleRequest): Observable<{ success: boolean; data: User }> {
    return this.http.patch<{ success: boolean; data: User }>(`${this.api}/${id}/role`, body);
  }
  deleteUser(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.api}/${id}`);
  }
  restoreUser(id: number): Observable<{ success: boolean; data: User }> {
    return this.http.patch<{ success: boolean; data: User }>(`${this.api}/${id}/restore`, {});
  }
  getOnlineUsers(): Observable<{ success: boolean; data: number[] }> {
    return this.http.get<{ success: boolean; data: number[] }>(`${this.api}/online-users`);
  }

  changePassword(body: { currentPassword: string; newPassword: string }): Observable<{ success: boolean; message: string }> {
  return this.http.patch<{ success: boolean; message: string }>(
    `${environment.apiUrl}/auth/change-password`, body
  );
}
}

