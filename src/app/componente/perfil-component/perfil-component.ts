import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {finalize} from 'rxjs';
import {CompraService, mensajeDeError} from '../../services/compra.service';

@Component({imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule], styleUrl: './perfil-component.css', templateUrl: './perfil-component.html'})
export class PerfilCliente implements OnInit {
  private readonly compra = inject(CompraService);
  protected readonly correo = signal('');
  protected readonly ocupado = signal(true);
  protected readonly guardado = signal(false);
  protected readonly error = signal('');
  protected readonly formulario = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    ciudad: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    distrito: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    direccion: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(250)]],
  });

  ngOnInit() {
    this.compra.perfil().pipe(finalize(() => this.ocupado.set(false))).subscribe({
      next: p => {
        this.correo.set(p.correo);
        this.formulario.setValue({nombre: p.nombre ?? '', telefono: p.telefono ?? '',
          ciudad: p.ciudad ?? '', distrito: p.distrito ?? '', direccion: p.direccion ?? ''});
      },
      error: error => this.error.set(mensajeDeError(error)),
    });
  }

  guardar() {
    if (this.ocupado()) return;
    this.guardado.set(false);
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.ocupado.set(true);
    this.error.set('');
    this.compra.guardarPerfil(this.formulario.getRawValue()).pipe(finalize(() => this.ocupado.set(false))).subscribe({
      next: () => this.guardado.set(true),
      error: error => this.error.set(mensajeDeError(error)),
    });
  }
}
