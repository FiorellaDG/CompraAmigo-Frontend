import {CurrencyPipe} from '@angular/common';
import {Component, OnInit, computed, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {Observable, finalize, forkJoin} from 'rxjs';
import {CarritoItem, TotalCheckout} from '../../model/compra';
import {CompraService, mensajeDeError} from '../../services/compra.service';
import {LoginService} from '../../services/login-service';

@Component({
  selector: 'app-carrito-component',
  imports: [CurrencyPipe, MatButtonModule, RouterLink],
  templateUrl: './carrito-component.html',
  styleUrl: './carrito-component.css',
})
export class CarritoComponent implements OnInit {
  private readonly compra = inject(CompraService);
  private readonly loginService = inject(LoginService);
  protected readonly items = signal<CarritoItem[]>([]);
  protected readonly cargando = signal(true);
  protected readonly pendiente = signal(false);
  protected readonly error = signal('');
  protected readonly subtotal = computed(() => this.items().reduce((total, item) => total + item.subtotal, 0));
  protected readonly impacto = signal<number | null>(null);
  protected readonly totalEstandar = signal<TotalCheckout | null>(null);

  private obtenerUserId(): number {
    const token = this.loginService.getToken();
    if (!token) return 0;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Number(payload.userId ?? payload.id ?? 0);
    } catch {
      return 0;
    }
  }

  ngOnInit() {
    const userId = this.obtenerUserId();
    this.cargarImpacto();
    this.compra.listarCarrito(userId).pipe(finalize(() => this.cargando.set(false))).subscribe({
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
      next: resultado => { aplicar(resultado); this.cargarImpacto(); },
      error: error => this.error.set(mensajeDeError(error)),
    });
  }

  private cargarImpacto() {
    this.impacto.set(null);
    this.totalEstandar.set(null);
    forkJoin({impacto: this.compra.impactoCarrito(), total: this.compra.totalCheckout('estandar')}).subscribe({
      next: ({impacto, total}) => {
        this.impacto.set(impacto.kgCo2Ahorrados);
        this.totalEstandar.set(total);
      },
      error: error => this.error.set(mensajeDeError(error)),
    });
  }
}