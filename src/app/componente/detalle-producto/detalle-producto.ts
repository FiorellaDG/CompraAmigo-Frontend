import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { finalize } from 'rxjs';
import { Producto } from '../../model/compra';
import { imagenProducto, tallasProducto } from '../../model/presentacion-producto';
import { CompraService, mensajeDeError } from '../../services/compra.service';
import { LoginService } from '../../services/login-service';

@Component({
  selector: 'app-detalle-producto',
  imports: [CurrencyPipe, DecimalPipe, RouterLink, MatButtonModule],
  templateUrl: './detalle-producto.html',
})
export class DetalleProducto implements OnInit {
  private readonly compra = inject(CompraService);
  private readonly ruta = inject(ActivatedRoute);
  protected readonly loginService = inject(LoginService);
  protected readonly producto = signal<Producto | null>(null);
  protected readonly cargando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly agregado = signal(false);
  protected readonly imagen = imagenProducto;
  protected readonly tallas = tallasProducto;

  ngOnInit() {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    this.compra.producto(id).pipe(finalize(() => this.cargando.set(false))).subscribe({
      next: producto => this.producto.set(producto),
      error: error => this.error.set(mensajeDeError(error)),
    });
  }

  agregar(producto: Producto, talla: string) {
    const userId = Number(localStorage.getItem('userId'));
    if (!userId || this.enviando()) return;
    this.error.set('');
    this.agregado.set(false);
    this.enviando.set(true);
    this.compra.agregar(userId, producto.id, talla).pipe(finalize(() => this.enviando.set(false))).subscribe({
      next: () => this.agregado.set(true),
      error: error => this.error.set(mensajeDeError(error)),
    });
  }

  esUsuario(): boolean {
    const rol = this.loginService.getRol() ?? '';
    return rol.includes('ROLE_USER');
  }
}