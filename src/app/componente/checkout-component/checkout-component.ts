import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {CurrencyPipe} from '@angular/common';
import {Component, DestroyRef, OnInit, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {catchError, EMPTY, finalize, merge, startWith, Subject, switchMap} from 'rxjs';
import {CarritoItem, TotalCheckout} from '../../model/compra';
import {CompraService, mensajeDeError} from '../../services/compra.service';
import {SesionService} from '../../services/sesion.service';
import {EcoImpacto} from '../eco-impacto-component/eco-impacto-component';

@Component({
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, CurrencyPipe, ReactiveFormsModule, MatButtonModule, RouterLink, EcoImpacto],
  styleUrl: './checkout-component.css', templateUrl: './checkout-component.html',
})
export class Checkout implements OnInit {
  private readonly compra = inject(CompraService);
  private readonly usuario = inject(SesionService).sesion()!;
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recotizar = new Subject<void>();
  protected readonly items = signal<CarritoItem[]>([]);
  protected readonly cargando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly errorCotizacion = signal('');
  protected readonly total = signal<TotalCheckout | null>(null);
  protected readonly impacto = signal<number | null>(null);
  protected readonly formulario = inject(FormBuilder).nonNullable.group({
    nombreReceptor: [this.usuario.nombre, Validators.required],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    ciudad: ['', Validators.required],
    distrito: ['', Validators.required],
    direccionEnvio: ['', Validators.required],
    metodoEnvio: ['estandar', Validators.required],
    metodoPago: ['Contra entrega', Validators.required],
  });

  ngOnInit() {
    this.compra.perfil().subscribe({
      next: perfil => {
        if (!this.formulario.dirty) {
          this.formulario.patchValue({nombreReceptor: perfil.nombre ?? '', telefono: perfil.telefono ?? '',
            ciudad: perfil.ciudad ?? '', distrito: perfil.distrito ?? '', direccionEnvio: perfil.direccion ?? ''});
        }
      },
      error: error => this.error.set(mensajeDeError(error)),
    });
    const metodoEnvio = this.formulario.controls.metodoEnvio;
    merge(metodoEnvio.valueChanges, this.recotizar).pipe(
      startWith(undefined),
      switchMap(() => {
        this.total.set(null);
        this.errorCotizacion.set('');
        return this.compra.totalCheckout(metodoEnvio.value).pipe(catchError(error => {
          this.errorCotizacion.set(mensajeDeError(error));
          return EMPTY;
        }));
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(total => this.total.set(total));
    this.compra.impactoCarrito().subscribe({
      next: impacto => this.impacto.set(impacto.kgCo2Ahorrados),
      error: error => this.error.set(mensajeDeError(error)),
    });
    this.compra.listarCarrito(this.usuario.userId).pipe(finalize(() => this.cargando.set(false))).subscribe({
      next: items => this.items.set(items),
      error: error => this.error.set(mensajeDeError(error)),
    });
  }

  reintentarCotizacion() {
    this.recotizar.next();
  }

  confirmar() {
    if (this.enviando() || !this.items().length || !this.total()) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.error.set('');
    this.enviando.set(true);
    this.compra.crearPedido(this.formulario.getRawValue()).pipe(finalize(() => this.enviando.set(false))).subscribe({
      next: pedido => {
        this.items.set([]);
        void this.router.navigate(['/pedidos', pedido.pedidoId, 'confirmacion']);
      },
      error: error => this.error.set(mensajeDeError(error)),
    });
  }
}
