import {ConfirmarProducto} from '../confirmar-producto-component/confirmar-producto-component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {CurrencyPipe} from '@angular/common';
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {finalize, forkJoin} from 'rxjs';
import {Categoria, Producto, ProductoEditable} from '../../model/compra';
import {CompraService, mensajeDeError} from '../../services/compra.service';

@Component({imports: [MatFormFieldModule, MatInputModule, MatSelectModule, CurrencyPipe, ReactiveFormsModule, MatButtonModule, MatDialogModule], styleUrl: './admin-productos-component.css', templateUrl: './admin-productos-component.html'})
export class AdminProductos implements OnInit {
  private readonly compra = inject(CompraService);
  private readonly dialogo = inject(MatDialog);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly busqueda = signal('');
  protected readonly productosVisibles = computed(() => {
    const normalizar = (texto: string) => texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
    const termino = normalizar(this.busqueda().trim());
    return this.productos().filter(producto => normalizar(producto.nombre).includes(termino));
  });
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly editando = signal<number | null>(null);
  protected readonly formularioVisible = signal(false);
  protected readonly ocupado = signal(true);
  protected readonly aviso = signal('');
  protected readonly error = signal('');
  protected readonly formulario = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    descripcion: ['', Validators.maxLength(255)],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/)]],
    co2: [0, [Validators.required, Validators.min(0)]],
    imagen: ['', Validators.maxLength(255)],
    tallas: ['', Validators.maxLength(255)],
    categoriaId: [0, Validators.min(1)],
  });

  ngOnInit() {
    forkJoin({productos: this.compra.listarProductos(), categorias: this.compra.categorias()})
      .pipe(finalize(() => this.ocupado.set(false))).subscribe({
        next: ({productos, categorias}) => { this.productos.set(productos); this.categorias.set(categorias); },
        error: error => this.error.set(mensajeDeError(error)),
      });
  }

  abrir(producto?: Producto) {
    this.editando.set(producto?.id ?? null);
    this.formulario.reset({
      nombre: producto?.nombre ?? '', descripcion: producto?.descripcion ?? '',
      precio: producto?.precio ?? 0, stock: producto?.stock ?? 0, co2: producto?.co2 ?? 0,
      imagen: producto?.imagen ?? '', tallas: producto?.tallas ?? '', categoriaId: producto?.categoria?.id ?? 0,
    });
    this.formularioVisible.set(true);
  }

  guardar() {
    if (this.ocupado() || this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const {categoriaId, ...valores} = this.formulario.getRawValue();
    const id = this.editando();
    const producto: ProductoEditable = {...valores, ...(id === null ? {} : {id}), categoria: {id: categoriaId}};
    this.iniciarOperacion();
    this.compra.guardarProducto(producto).pipe(finalize(() => this.ocupado.set(false))).subscribe({
      next: guardado => {
        this.productos.update(productos => id === null ? [...productos, guardado]
          : productos.map(p => p.id === id ? guardado : p));
        this.formularioVisible.set(false);
        this.aviso.set('Producto guardado.');
      },
      error: error => this.error.set(mensajeDeError(error)),
    });
  }

  guardarStock(producto: Producto, valor: string) {
    const stock = Number(valor);
    if (this.ocupado() || !valor.trim() || !Number.isInteger(stock) || stock < 0) {
      this.error.set('Ingresa un stock entero mayor o igual a cero.');
      return;
    }
    this.iniciarOperacion();
    this.compra.actualizarStock(producto.id, stock).pipe(finalize(() => this.ocupado.set(false))).subscribe({
      next: ajuste => {
        this.productos.update(items => items.map(p => p.id === producto.id ? {...p, stock: ajuste.stock} : p));
        this.aviso.set('Stock actualizado.');
      },
      error: error => this.error.set(mensajeDeError(error)),
    });
  }

  eliminar(producto: Producto) {
    if (this.ocupado()) return;
    this.dialogo.open(ConfirmarProducto, {data: producto.nombre}).afterClosed().subscribe(confirmado => {
      if (confirmado !== true || this.ocupado()) return;
      this.iniciarOperacion();
      this.compra.eliminarProducto(producto.id).pipe(finalize(() => this.ocupado.set(false))).subscribe({
        next: () => {
          this.productos.update(items => items.filter(p => p.id !== producto.id));
          if (this.editando() === producto.id) this.formularioVisible.set(false);
          this.aviso.set('Producto eliminado.');
        },
        error: error => this.error.set(mensajeDeError(error)),
      });
    });
  }

  private iniciarOperacion() {
    this.error.set('');
    this.aviso.set('');
    this.ocupado.set(true);
  }
}
