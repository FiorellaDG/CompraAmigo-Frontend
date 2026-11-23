import { Injectable } from '@angular/core';
import { ItemCarrito } from '../model/carrito.model';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private items: ItemCarrito[] = [];

  obtenerItems(): ItemCarrito[] {
    return this.items;
  }

  agregarProducto(producto: ItemCarrito): void {
    const existente = this.items.find(i => i.idProducto === producto.idProducto);
    if (existente) {
      existente.cantidad += producto.cantidad;
    } else {
      this.items.push({ ...producto });
    }
  }

  actualizarCantidad(idProducto: number, cantidad: number): void {
    const item = this.items.find(i => i.idProducto === idProducto);
    if (item && cantidad > 0) {
      item.cantidad = cantidad;
    }
  }

  eliminarProducto(idProducto: number): void {
    this.items = this.items.filter(i => i.idProducto !== idProducto);
  }

  vaciarCarrito(): void {
    this.items = [];
  }

  calcularSubtotal(): number {
    return this.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }
}