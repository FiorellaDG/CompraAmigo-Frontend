import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoginService } from '../../services/login-service';
import { RequestDto } from '../../model/request-dto';
import { RegistroDto } from '../../model/registro-dto';
import { MatChipsModule } from '@angular/material/chips';


@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent implements OnInit {
  router = inject(Router);
  fb = inject(FormBuilder);
  loginService = inject(LoginService);

  loginForm: FormGroup;
  registerForm: FormGroup;
  ocultarPassword = true;
  tabIndex = 0;

  constructor() {
    this.loginForm = this.fb.group({
      tipoAcceso: ['ROLE_USER', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  ngOnInit(): void {
    if (localStorage.getItem('token') !== null) {
      localStorage.clear();
    }
  }

  onSubmitLogin(): void {
    if (this.loginForm.invalid) {
      alert('Por favor completa todos los campos correctamente.');
      return;
    }

    const tipoSeleccionado = this.loginForm.value.tipoAcceso;
    const requestDto = new RequestDto();
    requestDto.username = this.loginForm.value.username;
    requestDto.password = this.loginForm.value.password;

    this.loginService.login(requestDto).subscribe({
      next: (data) => {
        const rolReal = data.roles && data.roles.length > 0 ? data.roles[0] : '';

        if (rolReal !== tipoSeleccionado) {
          this.loginService.logout();
          const nombrePerfil = tipoSeleccionado === 'ROLE_ADMIN' ? 'Administrador' : 'Usuario';
          alert(`Esta cuenta no tiene permisos de ${nombrePerfil}. Cambia el tipo de ingreso.`);
          return;
        }

        localStorage.setItem('rol', rolReal);
        localStorage.setItem('nombre', data.nombre || '');
        localStorage.setItem('userId', String(data.userId || ''));

        alert(`¡Bienvenido ${data.nombre || data.username}!`);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error(err);
        alert('Credenciales incorrectas o error de conexión con el servidor.');
      },
    });
  }

  onSubmitRegister(): void {
    if (this.registerForm.invalid) {
      alert('Completa todos los campos del registro correctamente.');
      return;
    }

    const registroDto: RegistroDto = this.registerForm.value;

    this.loginService.registrar(registroDto).subscribe({
      next: () => {
        alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión como Usuario.');
        this.registerForm.reset();
        this.tabIndex = 0;
      },
      error: (err) => {
        console.error(err);
        alert('No se pudo registrar. Verifica si el correo ya existe.');
      },
    });
  }
}
