export interface ItemCarrito {
  idProducto: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagenUrl?: string;
}

export interface CarritoResumen {
  items: ItemCarrito[];
  subtotal: number;
  cantidadTotal: number;
}