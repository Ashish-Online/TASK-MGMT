import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TaskAttachment } from '../models/task-attachment.model';

@Injectable({ providedIn: 'root' })
export class TaskAttachmentService {
  private readonly base = `${environment.apiUrl}/taskAttachment`;
  constructor(private http: HttpClient) {}
  getAttachments(taskId: number): Observable<{ success: boolean; data: TaskAttachment[] }> {
    return this.http.get<{ success: boolean; data: TaskAttachment[] }>(
      `${this.base}/task/${taskId}`,
    );
  }
  uploadAttachments(taskId: number, files: File[]): Observable<HttpEvent<unknown>> {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    return this.http.request(
      new HttpRequest('POST', `${this.base}/${taskId}/attachments`, fd, { reportProgress: true }),
    );
  }

  updateAttachment(id: number, file: File): Observable<HttpEvent<unknown>> {
  const fd = new FormData();
  fd.append('file', file);
  return this.http.request(
    new HttpRequest('PATCH', `${this.base}/${id}`, fd, { reportProgress: true }),
  );
}

  deleteAttachment(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.base}/${id}`);
  }
}
