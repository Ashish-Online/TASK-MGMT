import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pagination } from '../../../core/models/user.model';
@Component({ selector: 'app-pagination', standalone: true, imports: [CommonModule],
  template: `@if(pagination && pagination.totalPages>1){<div class="flex items-center justify-between px-4 py-3 border-t border-slate-100"><p class="text-xs text-slate-500">Page {{pagination.page}} of {{pagination.totalPages}} &bull; {{pagination.totalRecords}} total</p><div class="flex gap-2"><button (click)="prev()" [disabled]="pagination.page<=1" class="px-3 py-1 text-xs border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50">← Prev</button><button (click)="next()" [disabled]="pagination.page>=pagination.totalPages" class="px-3 py-1 text-xs border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50">Next →</button></div></div>}`
})
export class PaginationComponent {
  @Input() pagination: Pagination|null=null;
  @Output() pageChange = new EventEmitter<number>();
  prev() { if(this.pagination && this.pagination.page>1) this.pageChange.emit(this.pagination.page-1); }
  next() { if(this.pagination && this.pagination.page<this.pagination.totalPages) this.pageChange.emit(this.pagination.page+1); }
}
