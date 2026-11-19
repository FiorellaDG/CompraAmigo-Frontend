import { Routes } from '@angular/router';
import { DetalleProducto } from './componente/detalle-producto/detalle-producto';

export const routes: Routes = [
  { path: 'producto/:id', component: DetalleProducto }
];