import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermissionCode } from '../constants/permissions.constant';

export const permissionGuard = (...codes: PermissionCode[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  return auth.hasAnyPermission(...codes) ? true : inject(Router).createUrlTree(['/dashboard']);
};
