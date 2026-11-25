import {CurrencyPipe, DatePipe} from '@angular/common';
import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {EMPTY, Subject, catchError, finalize, startWith, switchMap} from 'rxjs';
import {ESTADOS_PEDIDO, Pedido} from '../../model/compra';
import {CompraService, mensajeDeError} from '../../services/compra.service';
import {EcoImpacto} from '../eco-impacto-component/eco-impacto-component';

@Component({imports: [CurrencyPipe, DatePipe, RouterLink, MatButtonModule, EcoImpacto], styleUrl: './detalle-pedido-component.css', templateUrl: './detalle-pedido-component.html'})
export class DetallePedido implements OnInit {
  private readonly compra = inject(CompraService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recargar = new Subject<void>();
  protected readonly confirmacion = this.ruta.snapshot.data['confirmacion'] === true;
  protected readonly pedido = signal<Pedido | null>(null);
  protected readonly estados = ESTADOS_PEDIDO;
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly enlaceValido = signal(false);

  ngOnInit() {
    this.ruta.paramMap.pipe(
      switchMap(params => {
        this.pedido.set(null);
        this.error.set('');
        const segmento = params.get('id') ?? '';
        const id = Number(segmento);
        this.enlaceValido.set(/^\d+$/.test(segmento) && Number.isSafeInteger(id) && id > 0);
        if (!this.enlaceValido()) {
          this.error.set('El enlace del pedido no es válido. Puedes abrirlo desde Mis pedidos.');
          this.cargando.set(false);
          return EMPTY;
        }
        return this.recargar.pipe(startWith(undefined), switchMap(() => this.cargar(id)));
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(pedido => this.pedido.set(pedido));
  }

  reintentar() {
    this.recargar.next();
  }

  private cargar(id: number) {
    this.cargando.set(true);
    this.error.set('');
    return this.compra.pedido(id).pipe(
      catchError(error => { this.error.set(mensajeDeError(error)); return EMPTY; }),
      finalize(() => this.cargando.set(false)),
    );
  }
}
