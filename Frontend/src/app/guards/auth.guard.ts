import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  const currentUser = authService.currentUserValue;
  
  if (currentUser) {
    // Verificar si la ruta tiene restricciones de roles
    if (route.data['roles'] && route.data['roles'].indexOf(currentUser.role) === -1) {
      // Rol no autorizado, redirigir a la página de inicio
      router.navigate(['/']);
      return false;
    }

    // Autorizado, retornar true
    return true;
  }

  // No está logueado, redirigir a la página de login
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};