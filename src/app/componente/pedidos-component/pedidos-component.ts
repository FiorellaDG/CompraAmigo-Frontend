import {CurrencyPipe, DatePipe} from '@angular/common';
import {Component, OnInit, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {finalize} from 'rxjs';
import {Pedido} from '../../model/compra';
import {CompraService, mensajeDeError} from '../../services/compra.service';
import {SesionService} from '../../services/sesion.service';
import {EcoImpacto} from '../eco-impacto-component/eco-impacto-component';

@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink, MatButtonModule, EcoImpacto],
  styleUrl: './pedidos-component.css', templateUrl: './pedidos-component.html',
})
export class Pedidos implements OnInit {
  private readonly compra = inject(CompraService);
  private readonly usuario = inject(SesionService).sesion()!;
  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.error.set('');
    this.compra.listarPedidos(this.usuario.userId).pipe(finalize(() => this.cargando.set(false))).subscribe({
      next: pedidos => this.pedidos.set(pedidos),
      error: error => this.error.set(mensajeDeError(error)),
    });
  }
}
