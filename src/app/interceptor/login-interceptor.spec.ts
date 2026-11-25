import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {describe, expect, it, vi} from 'vitest';
import {environment} from '../../environments/environment';
import {LoginService} from '../services/login-service';
import {loginInterceptor} from './login-interceptor';

describe('loginInterceptor', () => {
  function preparar() {
    const login = {getToken: vi.fn().mockReturnValue('sesion-anterior'), logout: vi.fn()};
    const router = {navigate: vi.fn()};
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loginInterceptor])),
        provideHttpClientTesting(),
        {provide: LoginService, useValue: login},
        {provide: Router, useValue: router},
      ],
    });
    const url = environment.apiURL + '/v1/profile';
    const http = TestBed.inject(HttpClient);
    const pruebas = TestBed.inject(HttpTestingController);
    const error = vi.fn();
    http.get(url).subscribe({error});
    const pendiente = pruebas.expectOne(url);
    expect(pendiente.request.headers.get('Authorization')).toBe('Bearer sesion-anterior');
    return {pendiente, login, router, error, pruebas};
  }

  it('conserva la sesión nueva cuando falla una petición de la cuenta anterior', () => {
    const {pendiente, login, router, error, pruebas} = preparar();
    login.getToken.mockReturnValue('sesion-nueva');
    pendiente.flush(null, {status: 401, statusText: 'Unauthorized'});
    expect(error).toHaveBeenCalledOnce();
    expect(login.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    pruebas.verify();
  });

  it('cierra la sesión cuando la petición rechazada usa el token vigente', () => {
    const {pendiente, login, router, pruebas} = preparar();
    pendiente.flush(null, {status: 401, statusText: 'Unauthorized'});
    expect(login.logout).toHaveBeenCalledOnce();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    pruebas.verify();
  });
});
