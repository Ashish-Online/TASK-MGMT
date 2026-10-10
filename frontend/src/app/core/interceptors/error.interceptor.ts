import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const storage = inject(StorageService);
  return next(req).pipe(
    catchError((e: HttpErrorResponse) => {
      if (e.status === 401) { 

        console.log('401 DETECTED -> CLEARING STORAGE');

        storage.clear(); 
        router.navigate(['/login']); 
      
      }
      return throwError(() => new Error(e.error?.message || e.message || 'Unexpected error'));
    })
  );
};
