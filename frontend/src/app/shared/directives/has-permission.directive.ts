import { Directive, Input, TemplateRef, ViewContainerRef, effect } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { PermissionCode } from '../../core/constants/permissions.constant';
@Directive({ selector: '[hasPermission]', standalone: true })
export class HasPermissionDirective {
  private required: PermissionCode[] = [];
  constructor(private tpl: TemplateRef<unknown>, private vc: ViewContainerRef, private auth: AuthService) {
    effect(() => this.update());
  }
  @Input() set hasPermission(codes: PermissionCode | PermissionCode[]) {
    this.required = Array.isArray(codes) ? codes : [codes]; this.update();
  }
  private update(): void {
    this.required.some(c => this.auth.hasPermission(c)) ? this.vc.createEmbeddedView(this.tpl) : this.vc.clear();
  }
}
