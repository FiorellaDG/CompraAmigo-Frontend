import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

export interface ProductoFicha {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria?: { nombre: string };
  imagenUrl?: string;
  tallas?: string[];
}

@Component({
  selector: 'app-detalle-producto',
  imports: [CurrencyPipe, RouterLink, MatButtonModule],
  templateUrl: './detalle-producto.html',
})
export class DetalleProducto implements OnInit {
  private readonly ruta = inject(ActivatedRoute);
  protected readonly producto = signal<ProductoFicha | null>(null);
  protected readonly cargando = signal(true);
  protected readonly tallaSeleccionada = signal('M');

  ngOnInit() {
    const id = Number(this.ruta.snapshot.paramMap.get('id')) || 1;
    // Datos base temporales hasta integrar el servicio de catálogo de Fiorella
    this.producto.set({
      id,
      nombre: 'Polo Básico Sostenible',
      descripcion: 'Algodón orgánico certificado de comercio justo.',
      precio: 59.9,
      stock: 15,
      categoria: { nombre: 'Ropa' },
      tallas: ['S', 'M', 'L', 'XL'],
    });
    this.cargando.set(false);
  }
}