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

type OrdenCatalogo = 'original' | 'precio-menor' | 'precio-mayor' | 'nombre';

@Component({
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, CurrencyPipe, MatButtonModule, RouterLink],
  styleUrl: './catalogo-component.css', templateUrl: './catalogo-component.html',
})
export class Catalogo implements OnInit {
  private readonly compra = inject(CompraService);
  protected readonly sesion = inject(SesionService);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly busqueda = signal('');
  protected readonly orden = signal<OrdenCatalogo>('original');
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
    const productos = this.productos().filter(producto =>
      (categoria === null || producto.categoria?.id === categoria) &&
      normalizar(producto.nombre).includes(termino),
    );
    switch (this.orden()) {
      case 'precio-menor': return productos.sort((a, b) => a.precio - b.precio);
      case 'precio-mayor': return productos.sort((a, b) => b.precio - a.precio);
      case 'nombre': return productos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      default: return productos;
    }
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
  private readonly imagenesFallidas = signal<ReadonlySet<string>>(new Set());

  imagen(producto: Producto): string | null {
    const ruta = imagenProducto(producto);
    return ruta && !this.imagenesFallidas().has(ruta) ? ruta : null;
  }

  ocultarImagen(ruta: string) {
    this.imagenesFallidas.update(fallidas => new Set(fallidas).add(ruta));
  }

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
