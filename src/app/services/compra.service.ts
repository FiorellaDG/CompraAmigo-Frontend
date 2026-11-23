import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {CarritoItem, Categoria, DatosEntrega, Pedido, Perfil, Producto, ProductoEditable, TotalCheckout} from '../model/compra';

@Injectable({providedIn: 'root'})
export class CompraService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiURL;

  listarProductos() {
    return this.http.get<Producto[]>(this.url + '/productos');
  }

  producto(id: number) {
    return this.http.get<Producto>(`${this.url}/producto/${id}`);
  }

  categorias() {
    return this.http.get<Categoria[]>(this.url + '/categorias');
  }

  guardarProducto(producto: ProductoEditable) {
    return this.http.request<Producto>(producto.id == null ? 'POST' : 'PUT', this.url + '/producto', {body: producto});
  }

  eliminarProducto(id: number) {
    return this.http.delete<void>(`${this.url}/producto/${id}`);
  }

  actualizarStock(id: number, stock: number) {
    return this.http.patch<{stock: number}>(`${this.url}/v1/admin/products/${id}/stock`, {stock});
  }

  perfil() {
    return this.http.get<Perfil>(this.url + '/v1/profile');
  }

  guardarPerfil(perfil: Omit<Perfil, 'correo'>) {
    return this.http.put<Perfil>(this.url + '/v1/profile', perfil);
  }

  listarCarrito(userId: number) {
    return this.http.get<CarritoItem[]>(`${this.url}/carrito/usuario/${userId}`);
  }

  agregar(userID: number, productoID: number, talla: string) {
    return this.http.post<CarritoItem>(this.url + '/carrito/item', {
      userID, productoID, talla, cantidad: 1,
      // El DTO actual exige estos números. Spring calcula los valores finales.
      precio: 0, subtotal: 0, co2: 0,
    });
  }

  actualizarCantidad(id: number, cantidad: number) {
    return this.http.put<CarritoItem>(`${this.url}/carrito/item/${id}`, null, {params: {cantidad}});
  }

  quitar(id: number) {
    return this.http.delete<void>(`${this.url}/carrito/item/${id}`);
  }

  totalCheckout(envio: string) {
    return this.http.get<TotalCheckout>(this.url + '/v1/checkout/total', {params: {envio}});
  }

  crearPedido(entrega: DatosEntrega) {
    return this.http.post<Pedido>(this.url + '/v1/checkout', entrega);
  }

  listarPedidos(userId: number) {
    return this.http.get<Pedido[]>(`${this.url}/pedidos/usuario/${userId}`);
  }

  pedido(id: number) {
    return this.http.get<Pedido>(`${this.url}/pedido/${id}`);
  }

  listarPedidosAdmin() {
    return this.http.get<Pedido[]>(this.url + '/pedidos');
  }

  actualizarEstado(id: number, estado: string) {
    return this.http.put<Pedido>(`${this.url}/pedido/${id}/estado`, null, {params: {estado}});
  }

  impactoCarrito() {
    return this.http.get<{kgCo2Ahorrados: number; unidades: number}>(this.url + '/v1/cart/eco-impact');
  }

  chat(mensaje: string, pedidoId: number | null) {
    return this.http.post<{respuesta: string; ofrecerSoporte: boolean}>(this.url + '/v1/bot/chat', {mensaje, pedidoId});
  }

  crearTicket(asunto: string, mensaje: string, pedidoId: number | null) {
    return this.http.post<{id: number; codigo: string}>(this.url + '/v1/support/tickets', {asunto, mensaje, pedidoId});
  }
}

export function mensajeDeError(error: HttpErrorResponse): string {
  if (error.status === 0 || error.status === 502 || error.status === 504) {
    return 'No pudimos conectar con CompraAmigo. Comprueba que el backend esté encendido.';
  }
  if (error.status === 401 || error.status === 403) {
    return 'El servidor rechazó el acceso. Inicia sesión de nuevo con la cuenta correspondiente.';
  }
  return error.error?.message ?? 'La solicitud no se pudo completar.';
}