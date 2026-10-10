import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Permission } from '../models/auth.model';
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly api = `${environment.apiUrl}/permission`;
  constructor(private http: HttpClient) {}
  getPermissions(): Observable<{ success: boolean; data: Permission[] }> { return this.http.get<{ success: boolean; data: Permission[] }>(this.api); }
}
