import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {finalize} from 'rxjs';
import {CompraService, mensajeDeError} from '../../services/compra.service';

@Component({
  selector: 'app-chat-flotante',
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, RouterLink, MatButtonModule],
  styleUrl: './chat-flotante-component.css', templateUrl: './chat-flotante-component.html',
})
export class ChatFlotante {
  private readonly compra = inject(CompraService);
  protected readonly abierto = signal(false);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly mensajes = signal<{consulta: string; respuesta: string}[]>([]);
  protected readonly formulario = inject(FormBuilder).group({
    mensaje: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(250)]],
    pedidoId: [null as number | null, [Validators.min(1), Validators.pattern(/^\d+$/)]],
  });

  enviar() {
    const {mensaje, pedidoId} = this.formulario.getRawValue();
    const consulta = mensaje?.trim();
    if (!consulta || this.formulario.invalid || this.enviando()) return;
    this.error.set('');
    this.enviando.set(true);
    this.compra.chat(consulta, pedidoId).pipe(finalize(() => this.enviando.set(false))).subscribe({
      next: respuesta => {
        this.mensajes.update(items => [...items, {consulta, respuesta: respuesta.respuesta}]);
        const campoMensaje = this.formulario.controls.mensaje;
        if (campoMensaje.value === mensaje) campoMensaje.reset();
      },
      error: error => this.error.set(mensajeDeError(error)),
    });
  }
}
