import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {CurrencyPipe} from '@angular/common';
import {Component, OnInit, computed, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {finalize} from 'rxjs';
import {Producto} from '../../model/compra';
import {imagenProducto, tallasProducto} from '../../model/presentacion-producto';
import {CompraService, mensajeDeError} from '../../services/compra.service';
import {SesionService} from '../../services/sesion.service';

@Component({
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, CurrencyPipe, MatButtonModule, RouterLink],
  styleUrl: './catalogo-component.css', templateUrl: './catalogo-component.html',
})
export class Catalogo implements OnInit {
  private readonly compra = inject(CompraService);
  protected readonly sesion = inject(SesionService);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly busqueda = signal('');
  protected readonly categoriaSeleccionada = signal<number | null>(null);
  protected readonly categorias = computed(() => {
    const porId = new Map<number, string>();
    for (const {categoria} of this.productos()) {
      if (categoria?.nombre) porId.set(categoria.id, categoria.nombre);
    }
    return [...porId].sort((a, b) => a[1].localeCompare(b[1], 'es'));
  });
  protected readonly visibles = computed(() => {
    const normalizar = (texto: string) => texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
    const termino = normalizar(this.busqueda().trim());
    const categoria = this.categoriaSeleccionada();
    return this.productos().filter(producto =>
      (categoria === null || producto.categoria?.id === categoria) &&
      normalizar(producto.nombre).includes(termino),
    );
  });
  protected readonly cargando = signal(false);
  protected readonly errorCarga = signal('');
  protected readonly pendiente = signal<number | null>(null);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  ngOnInit() {
    this.cargarCatalogo();
  }

  cargarCatalogo() {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.errorCarga.set('');
    this.compra.listarProductos().pipe(finalize(() => this.cargando.set(false))).subscribe({
      next: productos => this.productos.set(productos),
      error: error => this.errorCarga.set(mensajeDeError(error)),
    });
  }

  protected readonly tallas = tallasProducto;
  protected readonly imagen = imagenProducto;

  agregar(producto: Producto, talla: string) {
    const usuario = this.sesion.sesion();
    if (!usuario || this.pendiente() !== null) return;
    this.error.set('');
    this.aviso.set('');
    this.pendiente.set(producto.id);
    this.compra.agregar(usuario.userId, producto.id, talla).pipe(
      finalize(() => this.pendiente.set(null)),
    ).subscribe({
      next: () => this.aviso.set(producto.nombre + ' se agregó al carrito.'),
      error: error => this.error.set(mensajeDeError(error)),
    });
  }
}
