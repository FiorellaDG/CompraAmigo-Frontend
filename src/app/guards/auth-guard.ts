import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('token');
    const rolGuardado = localStorage.getItem('rol');
    const rolRequerido = route.data?.['rol'];

    if (!token) {
      alert('No accesible! Debes iniciar sesión.');
      this.router.navigate(['/login']);
      return false;
    }

    if (rolRequerido && rolGuardado !== rolRequerido) {
      alert('No tienes permisos para acceder a esta sección.');
      this.router.navigate(['/home']);
      return false;
    }

    return true;
  }
}
