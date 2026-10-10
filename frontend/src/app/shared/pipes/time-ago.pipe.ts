import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'timeAgo', standalone: true, pure: true })
export class TimeAgoPipe implements PipeTransform {
  transform(v: string | Date | null): string {
    if (!v) return '—';
    const diff = Date.now() - new Date(v).getTime();
    const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d < 7)  return `${d}d ago`;
    return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
