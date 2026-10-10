import { Pipe, PipeTransform } from '@angular/core';
import { TaskPriority } from '../../core/models/task.model';
@Pipe({ name: 'priorityBadge', standalone: true, pure: true })
export class PriorityBadgePipe implements PipeTransform {
  transform(p: TaskPriority): string {
    const m: Record<TaskPriority, string> = {
      LOW:    'bg-slate-100 text-slate-600 border-slate-200',
      MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
      HIGH:   'bg-red-100 text-red-600 border-red-200',
    };
    return m[p] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  }
}
