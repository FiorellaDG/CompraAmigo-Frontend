import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {CurrencyPipe, DecimalPipe} from '@angular/common';
import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {EMPTY, catchError, finalize, switchMap} from 'rxjs';
import {Producto} from '../../model/compra';
import {imagenProducto, tallasProducto} from '../../model/presentacion-producto';
import {CompraService, mensajeDeError} from '../../services/compra.service';
import {SesionService} from '../../services/sesion.service';

@Component({imports: [MatFormFieldModule, MatSelectModule, CurrencyPipe, DecimalPipe, RouterLink, MatButtonModule], styleUrl: './detalle-producto-component.css', templateUrl: './detalle-producto-component.html'})
export class DetalleProducto implements OnInit {
  private readonly compra = inject(CompraService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly sesion = inject(SesionService);
  protected readonly producto = signal<Producto | null>(null);
  protected readonly cargando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly agregado = signal(false);
  protected readonly imagenFallida = signal<string | null>(null);
  protected readonly tallas = tallasProducto;

  imagen(producto: Producto): string | null {
    const ruta = imagenProducto(producto);
    return this.imagenFallida() === ruta ? null : ruta;
  }

  ngOnInit() {
    this.ruta.paramMap.pipe(
      switchMap(params => {
        this.producto.set(null);
        this.error.set('');
        this.agregado.set(false);
        this.imagenFallida.set(null);
        const segmento = params.get('id') ?? '';
        const id = Number(segmento);
        if (!/^\d+$/.test(segmento) || !Number.isSafeInteger(id) || id < 1) {
          this.error.set('El enlace del producto no es válido. Vuelve al catálogo para elegir uno.');
          this.cargando.set(false);
          return EMPTY;
        }
        this.cargando.set(true);
        return this.compra.producto(id).pipe(
          catchError(error => { this.error.set(mensajeDeError(error)); return EMPTY; }),
          finalize(() => this.cargando.set(false)),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(producto => this.producto.set(producto));
  }

  agregar(producto: Producto, talla: string) {
    const sesion = this.sesion.sesion();
    if (!sesion || this.enviando()) return;
    this.error.set('');
    this.agregado.set(false);
    this.enviando.set(true);
    this.compra.agregar(sesion.userId, producto.id, talla).pipe(finalize(() => this.enviando.set(false))).subscribe({
      next: () => { if (this.producto()?.id === producto.id) this.agregado.set(true); },
      error: error => { if (this.producto()?.id === producto.id) this.error.set(mensajeDeError(error)); },
    });
  }
}
