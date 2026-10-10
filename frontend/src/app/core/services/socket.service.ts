import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;
  private destroy$ = new Subject<void>();

  connect(userId: number): void {
    if (this.socket?.connected) return;
    this.socket = io(environment.socketUrl, { transports: ['websocket'], reconnectionAttempts: 5 });
    this.socket.on('connect', () => this.socket!.emit('join', userId));
    this.socket.on('reconnect', () => this.socket!.emit('join', userId));
  }

  onNotification<T>(): Observable<T> {
    return new Observable(obs => { this.socket?.on('notification', (d: T) => obs.next(d)); });
  }

  // ✅ New method
  onUserStatusChanged(): Observable<{ userId: number; status: 'online' | 'offline' }> {
    return new Observable(obs => {
      this.socket?.on('user-status-changed', (d: { userId: number; status: 'online' | 'offline' }) => obs.next(d));
    });
  }

  // ✅ New method - socket join hone ka wait karne ke liye
  onConnected(): Observable<void> {
    return new Observable(obs => {
      if (this.socket?.connected) {
        obs.next();
        return;
      }
      this.socket?.on('connect', () => obs.next());
    });
  }

  disconnect(): void { this.socket?.disconnect(); this.socket = null; }
  ngOnDestroy(): void { this.disconnect(); this.destroy$.next(); this.destroy$.complete(); }
}