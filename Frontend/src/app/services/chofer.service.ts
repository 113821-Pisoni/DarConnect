// src/app/services/chofer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ChoferData, ChoferCreateDTO, UsuarioDisponible,EstadisticasChoferResponse } from '../interfaces/chofer.interface';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChoferService {
  private apiUrl = 'http://localhost:8080/choferes';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Obtiene los datos del chofer actualmente logueado
   */
  getCurrentChofer(): Observable<ChoferData> {
  const user = this.authService.currentUserValue;
  if (!user) {
    throw new Error('No hay usuario logueado');
  }

  return this.http.get<ChoferData>(`${this.apiUrl}/by-usuario/${user.id}`);
}

  /**
   * Obtiene el chofer por ID
   */
  getChoferById(id: number): Observable<ChoferData> {
    return this.http.get<ChoferData>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene todos los choferes (para administradores)
   */
  getAllChoferes(): Observable<ChoferData[]> {
    return this.http.get<ChoferData[]>(`${this.apiUrl}`);
  }

  /**
   * Actualiza los datos del chofer
   */
  updateChofer(id: number, chofer: Partial<ChoferData>): Observable<ChoferData> {
    return this.http.put<ChoferData>(`${this.apiUrl}/${id}`, chofer);
  }
  /**
   * Crear nuevo chofer (solo admin)
   */
  createChofer(chofer: ChoferCreateDTO): Observable<ChoferData> {
    return this.http.post<ChoferData>(this.apiUrl, chofer);
  }

  /**
   * Eliminar chofer - baja lógica (solo admin)
   */
  deleteChofer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Activar/Desactivar chofer (solo admin)
   */
  toggleEstadoChofer(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/estado`, {});
  }

  /**
   * Obtener usuarios disponibles para asignar como chofer (solo admin)
   */
  getUsuariosDisponibles(): Observable<UsuarioDisponible[]> {
    return this.http.get<UsuarioDisponible[]>(`${this.apiUrl}/usuarios-disponibles`);
  }

  getEstadisticasChofer(choferId: number, periodo: string = 'semana'): Observable<EstadisticasChoferResponse> {
  let params = new HttpParams().set('periodo', periodo);
  return this.http.get<EstadisticasChoferResponse>(`${this.apiUrl}/${choferId}/estadisticas`, { params });
}
}