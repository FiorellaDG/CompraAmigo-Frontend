import { Routes } from '@angular/router';
import { LoginComponent } from './componente/login-component/login-component';
import { HomeComponent } from './componente/home-component/home-component';
import { AuthGuard } from './guards/auth-guard';
import { DetalleProducto } from './componente/detalle-producto/detalle-producto';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'producto/:id', component: DetalleProducto },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];