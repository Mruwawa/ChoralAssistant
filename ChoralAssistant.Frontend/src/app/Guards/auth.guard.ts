import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthorizationService } from '../Services/authorization.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthorizationService);

  while (authService.loading()) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const userInfo = authService.userInfo();
  return userInfo.isAuthorized;
};
