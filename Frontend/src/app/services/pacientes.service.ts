// src/app/services/pacientes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente, PacienteCreateDTO, PacienteUpdateDTO } from '../interfaces/paciente.interface';

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private apiUrl = 'http://localhost:8080/pacientes';

  constructor(private http: HttpClient) { }

  // Obtener todos los pacientes
  getPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.apiUrl);
  }

  getPacientesActivos(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.apiUrl}/activos`);
  }


  // Obtener paciente por ID
  getPaciente(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/${id}`);
  }

  // Crear nuevo paciente
  createPaciente(paciente: PacienteCreateDTO): Observable<Paciente> {
    return this.http.post<Paciente>(this.apiUrl, paciente);
  }

  // Actualizar paciente
  updatePaciente(id: number, paciente: PacienteUpdateDTO): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.apiUrl}/${id}`, paciente);
  }

  // Eliminar paciente (baja lógica)
  deletePaciente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Activar/Desactivar paciente
  toggleEstadoPaciente(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/estado`, {});
  }
}