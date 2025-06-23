// src/app/services/usuarios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, UsuarioCreateDTO, UsuarioUpdateDTO } from '../interfaces/usuario.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = `${environment.apiUrl}/usuario`;

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  createUsuario(usuario: UsuarioCreateDTO): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  updateUsuario(id: number, usuario: UsuarioUpdateDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/password`, usuario);
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleEstadoUsuario(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/estado`, {});
  }

  resetPassword(id: number, password: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/password`, { password });
  }
}