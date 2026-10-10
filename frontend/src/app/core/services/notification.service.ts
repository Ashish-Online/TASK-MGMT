import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification, NotificationsResponse } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = `${environment.apiUrl}/notification`;
  unreadCount = signal<number>(0);
  constructor(private http: HttpClient) {}
  getNotifications(
    page = 1,
    limit = 10,
  ): Observable<{ success: boolean; data: NotificationsResponse }> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<{ success: boolean; data: NotificationsResponse }>(this.api, { params });
  }
  getUnreadCount(): Observable<{ success: boolean; data: { unreadCount: number } }> {
    return this.http
      .get<{ success: boolean; data: { unreadCount: number } }>(`${this.api}/unread-count`)
      .pipe(tap((res) => this.unreadCount.set(res.data.unreadCount)));
  }
  markAsRead(id: number): Observable<{ success: boolean; data: Notification }> {
    return this.http.patch<{ success: boolean; data: Notification }>(`${this.api}/${id}/read`, {});
  }
  markAllAsRead(): Observable<{ success: boolean; data: boolean }> {
    return this.http
      .patch<{ success: boolean; data: boolean }>(`${this.api}/read-all`, {})
      .pipe(tap(() => this.unreadCount.set(0)));
  }
}
