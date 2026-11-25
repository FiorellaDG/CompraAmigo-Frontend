import {CurrencyPipe} from '@angular/common';
import {Component, DestroyRef, OnInit, computed, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {EMPTY, Observable, Subject, catchError, finalize, forkJoin, startWith, switchMap} from 'rxjs';
import {CarritoItem, TotalCheckout} from '../../model/compra';
import {CompraService, mensajeDeError} from '../../services/compra.service';
import {SesionService} from '../../services/sesion.service';
import {EcoImpacto} from '../eco-impacto-component/eco-impacto-component';

@Component({
  imports: [CurrencyPipe, MatButtonModule, RouterLink, EcoImpacto],
  styleUrl: './carrito-component.css', templateUrl: './carrito-component.html',
})
export class Carrito implements OnInit {
  private readonly compra = inject(CompraService);
  private readonly usuario = inject(SesionService).sesion()!;
  private readonly destroyRef = inject(DestroyRef);
  private readonly actualizarResumen = new Subject<void>();
  protected readonly items = signal<CarritoItem[]>([]);
  protected readonly cargando = signal(true);
  protected readonly pendiente = signal(false);
  protected readonly error = signal('');
  protected readonly subtotal = computed(() => this.items().reduce((total, item) => total + item.subtotal, 0));
  protected readonly impacto = signal<number | null>(null);
  protected readonly totalEstandar = signal<TotalCheckout | null>(null);
  protected readonly errorResumen = signal('');

  ngOnInit() {
    this.actualizarResumen.pipe(
      startWith(undefined),
      switchMap(() => {
        this.impacto.set(null);
        this.totalEstandar.set(null);
        this.errorResumen.set('');
        return forkJoin({impacto: this.compra.impactoCarrito(), total: this.compra.totalCheckout('estandar')})
          .pipe(catchError(error => {
            this.errorResumen.set(mensajeDeError(error));
            return EMPTY;
          }));
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(({impacto, total}) => {
      this.impacto.set(impacto.kgCo2Ahorrados);
      this.totalEstandar.set(total);
    });
    this.compra.listarCarrito(this.usuario.userId).pipe(finalize(() => this.cargando.set(false))).subscribe({
      next: items => this.items.set(items),
      error: error => this.error.set(mensajeDeError(error)),
    });
  }

  cambiar(item: CarritoItem, cantidad: number) {
    if (this.pendiente() || cantidad < 1) return;
    this.mutar(this.compra.actualizarCantidad(item.id, cantidad), actualizado => {
      this.items.update(items => items.map(fila => fila.id === item.id ? actualizado : fila));
    });
  }

  quitar(item: CarritoItem) {
    if (this.pendiente()) return;
    this.mutar(this.compra.quitar(item.id), () => this.items.update(items => items.filter(fila => fila.id !== item.id)));
  }

  private mutar<T>(peticion: Observable<T>, aplicar: (resultado: T) => void) {
    this.error.set('');
    this.pendiente.set(true);
    peticion.pipe(finalize(() => this.pendiente.set(false))).subscribe({
      next: resultado => { aplicar(resultado); this.reintentarResumen(); },
      error: error => this.error.set(mensajeDeError(error)),
    });
  }

  reintentarResumen() {
    this.actualizarResumen.next();
  }
}
