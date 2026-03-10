import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JwtService } from '../Service/jwt.service';

export const authGuard: CanActivateFn = () => {
  const jwtService = inject(JwtService);
  const router = inject(Router);

  if (jwtService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
