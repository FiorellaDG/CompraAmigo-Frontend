import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RequestDto } from '../model/request-dto';
import { ResponseDto } from '../model/response-dto';
import { RegistroDto } from '../model/registro-dto';

const TOKEN_KEY = 'token';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly urlAuth = environment.apiURL + '/authenticate';
  private readonly urlRegister = environment.apiURL + '/register';

  login(request: RequestDto): Observable<ResponseDto> {
    return this.http.post<ResponseDto>(this.urlAuth, request, { observe: 'response' }).pipe(
      map((response) => {
        const bearerToken = response.headers.get('Authorization');
        if (bearerToken) {
          const token = bearerToken.replace('Bearer ', '');
          localStorage.setItem(TOKEN_KEY, token);
        } else if (response.body?.jwt) {
          localStorage.setItem(TOKEN_KEY, response.body.jwt);
        }
        return response.body as ResponseDto;
      }),
    );
  }

  registrar(registro: RegistroDto): Observable<string> {
    return this.http.post(this.urlRegister, registro, { responseType: 'text' });
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  logout(): void {
    localStorage.clear();
  }
}
