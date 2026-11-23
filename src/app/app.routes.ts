import { Routes } from '@angular/router';
import { LoginComponent } from './componente/login-component/login-component';
import { HomeComponent } from './componente/home-component/home-component';
import { CarritoComponent } from './componente/carrito-component/carrito-component';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'carrito', component: CarritoComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];