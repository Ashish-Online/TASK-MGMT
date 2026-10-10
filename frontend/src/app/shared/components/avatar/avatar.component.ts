import { Component, Input } from '@angular/core';
@Component({ selector: 'app-avatar', standalone: true,
  template: `<div [style.width.px]="size" [style.height.px]="size" [style.font-size.px]="size*.38" class="rounded-full flex items-center justify-center font-medium flex-shrink-0" [class]="colorClass">{{initials}}</div>`
})
export class AvatarComponent {
  @Input() firstName = ''; @Input() lastName = ''; @Input() size = 28;
  get initials() { return ((this.firstName[0]??'')+(this.lastName[0]??'')).toUpperCase()||'?'; }
  get colorClass() {
    const c = ['bg-indigo-100 text-indigo-700','bg-emerald-100 text-emerald-700','bg-amber-100 text-amber-700','bg-pink-100 text-pink-700','bg-cyan-100 text-cyan-700','bg-violet-100 text-violet-700'];
    return c[(this.firstName.charCodeAt(0)||0)%c.length];
  }
}
