// src/services/agenda.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agenda, AgendaCreateDTO } from '../interfaces/agenda.interface';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  private apiUrl = 'http://localhost:8080/agendas';

  constructor(private http: HttpClient) {}

  // Obtener todas las agendas
  getAgendas(): Observable<Agenda[]> {
    return this.http.get<Agenda[]>(`${this.apiUrl}`);
  }

  // Obtener agenda por ID
  getAgendaById(id: number): Observable<Agenda> {
    return this.http.get<Agenda>(`${this.apiUrl}/${id}`);
  }

  // Obtener agenda por ID de chofer
  getAgendaByChoferId(choferId: number): Observable<Agenda> {
    return this.http.get<Agenda>(`${this.apiUrl}/by-chofer/${choferId}`);
  }

  // Crear nueva agenda
  createAgenda(agenda: AgendaCreateDTO): Observable<Agenda> {
    return this.http.post<Agenda>(`${this.apiUrl}`, agenda);
  }

  // Desactivar agenda (baja lógica)
  deleteAgenda(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}