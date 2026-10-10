import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({ selector: 'app-confirm-dialog', standalone: true, imports: [CommonModule],
  template: `@if(open){<div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50" (click)="bd($event)"><div class="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-sm shadow-xl"><h3 class="font-semibold text-slate-900">{{title}}</h3><p class="text-sm text-slate-500 mt-2 mb-5">{{message}}</p><div class="flex justify-end gap-3"><button (click)="cancel.emit()" class="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button><button (click)="confirm.emit()" class="px-4 py-2 text-sm rounded-lg text-white" [class]="destructive?'bg-red-600 hover:bg-red-700':'bg-indigo-600 hover:bg-indigo-700'">{{confirmLabel}}</button></div></div></div>}`
})
export class ConfirmDialogComponent {
  @Input() open=false; @Input() title='Are you sure?'; @Input() message='This action cannot be undone.';
  @Input() confirmLabel='Confirm'; @Input() destructive=true;
  @Output() confirm=new EventEmitter<void>(); @Output() cancel=new EventEmitter<void>();
  bd(e: MouseEvent) { if((e.target as Element)===e.currentTarget) this.cancel.emit(); }
}
