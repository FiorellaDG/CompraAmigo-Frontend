import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {finalize} from 'rxjs';
import {CompraService, mensajeDeError} from '../../services/compra.service';

@Component({
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule],
  styleUrl: './soporte-component.css', templateUrl: './soporte-component.html',
})
export class Soporte {
  private readonly compra = inject(CompraService);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly codigo = signal('');
  protected readonly formulario = inject(FormBuilder).group({
    asunto: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(120)]],
    mensaje: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(2000)]],
    pedidoId: [null as number | null, [Validators.min(1), Validators.pattern(/^\d+$/)]],
  });

  registrar(formularioEstado: FormGroupDirective) {
    const {asunto, mensaje, pedidoId} = this.formulario.getRawValue();
    if (this.formulario.invalid || this.enviando() || !asunto?.trim() || !mensaje?.trim()) return;
    this.error.set('');
    this.codigo.set('');
    this.enviando.set(true);
    this.compra.crearTicket(asunto.trim(), mensaje.trim(), pedidoId)
      .pipe(finalize(() => this.enviando.set(false))).subscribe({
        next: ticket => {
          this.codigo.set(ticket.codigo);
          formularioEstado.resetForm();
        },
        error: error => this.error.set(mensajeDeError(error)),
      });
  }
}
