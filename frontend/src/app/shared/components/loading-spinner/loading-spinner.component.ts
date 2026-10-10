import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({ selector: 'app-loading-spinner', standalone: true, imports: [CommonModule],
  template: `<div class="flex items-center justify-center" [style.padding.px]="padding"><svg class="animate-spin text-indigo-500" [style.width.px]="size" [style.height.px]="size" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>@if(label){<span class="ml-2 text-sm text-slate-500">{{label}}</span>}</div>`
})
export class LoadingSpinnerComponent { @Input() size=20; @Input() padding=48; @Input() label=''; }
