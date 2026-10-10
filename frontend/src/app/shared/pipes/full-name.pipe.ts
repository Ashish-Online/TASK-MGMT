import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'fullName', standalone: true, pure: true })
export class FullNamePipe implements PipeTransform {
  transform(u: { firstName: string; lastName?: string | null } | null | undefined): string {
    if (!u) return '—';
    return [u.firstName, u.lastName].filter(Boolean).join(' ');
  }
}
