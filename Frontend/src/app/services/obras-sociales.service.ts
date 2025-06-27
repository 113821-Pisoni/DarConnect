// src/services/obras-sociales.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ObraSocial, ObraSocialCreateDTO, ObraSocialUpdateDTO } from '../interfaces/obraSocial.interface';

@Injectable({
  providedIn: 'root'
})
export class ObrasSocialesService {
  private apiUrl = 'http://localhost:8080/obras-sociales';

  constructor(private http: HttpClient) {}

  // Obtener todas las obras sociales
  getObrasSociales(): Observable<ObraSocial[]> {
    return this.http.get<ObraSocial[]>(`${this.apiUrl}`);
  }

  // Obtener solo obras sociales activas
  getObrasSocialesActivas(): Observable<ObraSocial[]> {
    return this.http.get<ObraSocial[]>(`${this.apiUrl}/activas`);
  }

  // Obtener obra social por ID
  getObraSocialById(id: number): Observable<ObraSocial> {
    return this.http.get<ObraSocial>(`${this.apiUrl}/${id}`);
  }

  // Crear nueva obra social
  createObraSocial(obraSocial: ObraSocialCreateDTO): Observable<ObraSocial> {
    return this.http.post<ObraSocial>(`${this.apiUrl}`, obraSocial);
  }

  // Actualizar obra social
  updateObraSocial(id: number, obraSocial: ObraSocialUpdateDTO): Observable<ObraSocial> {
    return this.http.put<ObraSocial>(`${this.apiUrl}/${id}`, obraSocial);
  }

  // Eliminar obra social (baja lógica)
  deleteObraSocial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Activar/Desactivar obra social
  toggleEstadoObraSocial(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/estado`, {});
  }
}