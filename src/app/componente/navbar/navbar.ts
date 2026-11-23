import { Component, inject } from '@angular/core';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [MatToolbar, MatButton, RouterLink, MatToolbarRow],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  router: Router = inject(Router);
  rol: any;

  estaLogueado(): boolean {
    return localStorage.getItem('token') !== null;
  }

  obtenerNombre(): string {
    return localStorage.getItem('nombre') || 'CompraAmigo';
  }

  esAdministrador(): boolean {
    this.rol = localStorage.getItem('rol');
    return this.rol === 'ROLE_ADMIN';
  }

  esUsuario(): boolean {
    this.rol = localStorage.getItem('rol');
    return this.rol === 'ROLE_USER';
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

