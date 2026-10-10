import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({ selector: 'app-badge', standalone: true, imports: [CommonModule],
  template: `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border" [class]="cls">{{label}}</span>`
})
export class BadgeComponent {
  @Input() type: 'status' | 'priority' = 'status';
  @Input() value = '';
  get label() { return this.value.replace(/_/g, ' '); }
  get cls(): string {
    if (this.type === 'status') {
      const m: Record<string,string> = { TODO:'bg-slate-100 text-slate-700 border-slate-200', IN_PROGRESS:'bg-blue-100 text-blue-700 border-blue-200', COMPLETED:'bg-emerald-100 text-emerald-700 border-emerald-200', APPROVED:'bg-green-100 text-green-800 border-green-200', REJECTED:'bg-red-100 text-red-700 border-red-200' };
      return m[this.value] ?? 'bg-slate-100 text-slate-600 border-slate-200';
    }
    const m: Record<string,string> = { LOW:'bg-slate-100 text-slate-600 border-slate-200', MEDIUM:'bg-amber-100 text-amber-700 border-amber-200', HIGH:'bg-red-100 text-red-600 border-red-200' };
    return m[this.value] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  }
}
