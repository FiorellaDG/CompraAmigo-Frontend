import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {CurrencyPipe, DecimalPipe} from '@angular/common';
import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {finalize} from 'rxjs';
import {Producto} from '../../model/compra';
import {imagenProducto, tallasProducto} from '../../model/presentacion-producto';
import {CompraService, mensajeDeError} from '../../services/compra.service';
import {SesionService} from '../../services/sesion.service';

@Component({imports: [MatFormFieldModule, MatSelectModule, CurrencyPipe, DecimalPipe, RouterLink, MatButtonModule], styleUrl: './detalle-producto-component.css', templateUrl: './detalle-producto-component.html'})
export class DetalleProducto implements OnInit {
  private readonly compra = inject(CompraService);
  private readonly ruta = inject(ActivatedRoute);
  protected readonly sesion = inject(SesionService);
  protected readonly producto = signal<Producto | null>(null);
  protected readonly cargando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly agregado = signal(false);
  protected readonly imagen = imagenProducto;
  protected readonly tallas = tallasProducto;

  ngOnInit() {
    const segmento = this.ruta.snapshot.paramMap.get('id') ?? '';
    const id = Number(segmento);
    if (!/^\d+$/.test(segmento) || !Number.isSafeInteger(id) || id < 1) {
      this.error.set('El enlace del producto no es válido. Vuelve al catálogo para elegir uno.');
      this.cargando.set(false);
      return;
    }
    this.compra.producto(id).pipe(finalize(() => this.cargando.set(false))).subscribe({
      next: producto => this.producto.set(producto),
      error: error => this.error.set(mensajeDeError(error)),
    });
  }

  agregar(producto: Producto, talla: string) {
    const sesion = this.sesion.sesion();
    if (!sesion || this.enviando()) return;
    this.error.set('');
    this.agregado.set(false);
    this.enviando.set(true);
    this.compra.agregar(sesion.userId, producto.id, talla).pipe(finalize(() => this.enviando.set(false))).subscribe({
      next: () => this.agregado.set(true),
      error: error => this.error.set(mensajeDeError(error)),
    });
  }
}
