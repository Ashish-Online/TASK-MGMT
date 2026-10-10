import { Pipe, PipeTransform } from '@angular/core';
import { TaskStatus } from '../../core/models/task.model';
@Pipe({ name: 'statusBadge', standalone: true, pure: true })
export class StatusBadgePipe implements PipeTransform {
  transform(s: TaskStatus): string {
    const m: Record<TaskStatus, string> = {
      TODO:        'bg-slate-100 text-slate-700 border-slate-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
      COMPLETED:   'bg-emerald-100 text-emerald-700 border-emerald-200',
      APPROVED:    'bg-green-100 text-green-800 border-green-200',
      REJECTED:    'bg-red-100 text-red-700 border-red-200',
    };
    return m[s] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  }
}
