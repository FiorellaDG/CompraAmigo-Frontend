export interface Sesion {
  jwt: string;
  userId: number;
  nombre: string;
  roles: string[];
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  co2: number;
  imagen: string | null;
  tallas: string | null;
  categoria?: Categoria;
}

export interface Categoria { id: number; nombre: string; }

export type ProductoEditable = Omit<Producto, 'id' | 'categoria'> & {
  id?: number;
  categoria: {id: number};
};

export interface Perfil {
  nombre: string;
  correo: string;
  telefono: string | null;
  ciudad: string | null;
  distrito: string | null;
  direccion: string | null;
}

export interface TotalCheckout { subtotal: number; costoEnvio: number; total: number; }

export interface CarritoItem {
  id: number;
  productoID: number;
  nombreProducto: string;
  precio: number;
  cantidad: number;
  talla: string;
  subtotal: number;
  co2: number;
}

export interface DatosEntrega {
  nombreReceptor: string;
  telefono: string;
  ciudad: string;
  distrito: string;
  direccionEnvio: string;
  metodoEnvio: string;
  metodoPago: string;
}

export interface Pedido {
  pedidoId: number;
  fecha: string;
  estado: string;
  estadoActualizadoEn: string | null;
  nombreUsuario: string;
  nombreReceptor: string;
  direccionEnvio: string;
  distrito: string;
  ciudad: string;
  metodoPago: string;
  metodoEnvio: string;
  subtotal: number;
  costoEnvio: number;
  total: number;
  co2Ahorrado: number;
  detalles: {detalleId: number; nombreProducto: string; cantidad: number; talla: string; precioUnitario: number}[];
}

export const ESTADOS_PEDIDO = ['En preparación', 'En camino', 'Entregado'] as const;