// src/app/services/traslado.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ChoferService } from './chofer.service';
import { switchMap } from 'rxjs/operators';
import { TrasladoDelDia, TrasladoDTO, TrasladoCreateDTO, TrasladoUpdateDTO, EstadoTraslado } from '../interfaces/traslado.interface';
import { AgendaSemanalResponse } from '../interfaces/agenda.interface';
import { GoogleMapsResponse } from '../interfaces/googleMaps.interface';

@Injectable({
  providedIn: 'root'
})
export class TrasladoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private choferService = inject(ChoferService);
  
  private apiUrl = 'http://localhost:8080/traslados';

  // ===== MÉTODOS PARA CHOFERES =====

  /**
   * Obtiene los traslados del día para el chofer logueado
   */
  getTrasladosDelDia(fecha?: string): Observable<TrasladoDelDia[]> {
    return this.choferService.getCurrentChofer().pipe(
      switchMap(chofer => {
        const url = `${this.apiUrl}/chofer/${chofer.id}/dia`;
        let params = new HttpParams();
        if (fecha) {
          params = params.set('fecha', fecha);
        }
        return this.http.get<TrasladoDelDia[]>(url, { params });
      })
    );
  }

  /**
   * Obtiene los traslados del día para un chofer específico
   */
  getTrasladosDelDiaPorChofer(choferId: number, fecha?: string): Observable<TrasladoDelDia[]> {
    const url = `${this.apiUrl}/chofer/${choferId}/dia`;
    let params = new HttpParams();
    if (fecha) {
      params = params.set('fecha', fecha);
    }
    return this.http.get<TrasladoDelDia[]>(url, { params });
  }

  /**
   * Obtiene agenda semanal del chofer
   */
  getAgendaSemanal(choferId: number): Observable<AgendaSemanalResponse> {
    return this.http.get<AgendaSemanalResponse>(`${this.apiUrl}/chofer/${choferId}/semana`);
  }

  /**
   * Obtiene traslados del día para admin (todos los choferes)
   */
  getTrasladosDelDiaAdmin(fecha?: string, estado?: EstadoTraslado): Observable<TrasladoDelDia[]> {
    let params = new HttpParams();
    
    if (fecha) {
      params = params.set('fecha', fecha);
    }
    
    if (estado) {
      params = params.set('estado', estado);
    }
    
    return this.http.get<TrasladoDelDia[]>(`${this.apiUrl}/admin/dia`, { params });
  }

  // ===== MÉTODOS CRUD PARA ADMINISTRADORES =====

  /**
   * Obtiene todos los traslados
   */
  getAllTraslados(): Observable<TrasladoDTO[]> {
    return this.http.get<TrasladoDTO[]>(`${this.apiUrl}`);
  }

  /**
   * Obtiene un traslado por ID
   */
  getTrasladoById(id: number): Observable<TrasladoDTO> {
    return this.http.get<TrasladoDTO>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene traslados activos
   */
  getTrasladosActivos(): Observable<TrasladoDTO[]> {
    return this.http.get<TrasladoDTO[]>(`${this.apiUrl}/activos`);
  }

  /**
   * Obtiene traslados por agenda ID
   */
  getTrasladosByAgenda(agendaId: number): Observable<TrasladoDTO[]> {
    return this.http.get<TrasladoDTO[]>(`${this.apiUrl}/by-agenda/${agendaId}`);
  }

  /**
   * Obtiene traslados por paciente ID
   */
  getTrasladosByPaciente(pacienteId: number): Observable<TrasladoDTO[]> {
    return this.http.get<TrasladoDTO[]>(`${this.apiUrl}/by-paciente/${pacienteId}`);
  }

  /**
   * Crea un nuevo traslado
   */
  createTraslado(traslado: TrasladoCreateDTO): Observable<TrasladoDTO> {
    return this.http.post<TrasladoDTO>(`${this.apiUrl}`, traslado);
  }

  /**
   * Actualiza un traslado
   */
  updateTraslado(id: number, traslado: TrasladoUpdateDTO): Observable<TrasladoDTO> {
    return this.http.put<TrasladoDTO>(`${this.apiUrl}/${id}`, traslado);
  }

  /**
   * Elimina un traslado (baja lógica)
   */
  deleteTraslado(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ===== MÉTODOS DE GESTIÓN DE ESTADOS =====

  /**
   * Obtiene el estado actual de un traslado
   */
  getEstadoTraslado(id: number, fecha?: string): Observable<EstadoTraslado> {
    const url = `${this.apiUrl}/${id}/estado`;
    let params = new HttpParams();
    if (fecha) {
      params = params.set('fecha', fecha);
    }
    return this.http.get<EstadoTraslado>(url, { params });
  }

  /**
   * Inicia un traslado
   */
  iniciarTraslado(trasladoId: number): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const body = {
      usuarioId: currentUser.id
    };

    return this.http.post<any>(`${this.apiUrl}/${trasladoId}/iniciar`, body);
  }

  /**
   * Finaliza un traslado
   */
  finalizarTraslado(trasladoId: number): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const body = {
      usuarioId: currentUser.id
    };

    return this.http.post<any>(`${this.apiUrl}/${trasladoId}/finalizar`, body);
  }

  /**
   * Cancela un traslado
   */
  cancelarTraslado(id: number, motivo: string): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const body = {
      usuarioId: currentUser.id,
      motivo: motivo
    };

    return this.http.post<any>(`${this.apiUrl}/${id}/cancelar`, body);
  }

  // ===== MÉTODOS HELPER =====

  /**
   * Convierte LocalTime a string legible
   */
  formatHora(horaProgramada: { hour: number; minute: number; second: number; nano: number }): string {
    const hour = horaProgramada.hour.toString().padStart(2, '0');
    const minute = horaProgramada.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  }

  /**
   * Formatear hora para display (string)
   */
  formatearHora(hora: string | any): string {
    if (!hora) return '--:--';
    
    // Si es string, tomar solo HH:mm
    if (typeof hora === 'string') {
      return hora.substring(0, 5);
    }
    
    // Si es array [hour, minute, second]
    if (Array.isArray(hora) && hora.length >= 2) {
      const h = hora[0].toString().padStart(2, '0');
      const m = hora[1].toString().padStart(2, '0');
      return `${h}:${m}`;
    }
    
    // Si es objeto {hour, minute}
    if (typeof hora === 'object' && hora.hour !== undefined && hora.minute !== undefined) {
      const h = hora.hour.toString().padStart(2, '0');
      const m = hora.minute.toString().padStart(2, '0');
      return `${h}:${m}`;
    }
    
    return '--:--';
  }

  /**
   * Convierte días seleccionados a string del backend
   */
  convertirDiasAString(diasSeleccionados: boolean[]): string {
    const dias: number[] = [];
    diasSeleccionados.forEach((seleccionado, index) => {
      if (seleccionado) {
        dias.push(index + 1); // 1-7 para lunes-domingo
      }
    });
    return dias.join(',');
  }

  /**
   * Convierte string del backend a array de días
   */
  convertirStringADias(diasString: string): boolean[] {
    const dias = new Array(7).fill(false);
    if (diasString) {
      const diasNumeros = diasString.split(',').map(d => parseInt(d.trim()));
      diasNumeros.forEach(dia => {
        if (dia >= 1 && dia <= 7) {
          dias[dia - 1] = true;
        }
      });
    }
    return dias;
  }

  /**
   * Obtiene nombres de días seleccionados
   */
  getNombresDias(diasString: string): string[] {
    const nombresDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const diasSeleccionados: string[] = [];
    
    if (diasString) {
      const diasNumeros = diasString.split(',').map(d => parseInt(d.trim()));
      diasNumeros.forEach(dia => {
        if (dia >= 1 && dia <= 7) {
          diasSeleccionados.push(nombresDias[dia - 1]);
        }
      });
    }
    
    return diasSeleccionados;
  }

  /**
   * Valida formato de hora
   */
  validarHora(hora: string): boolean {
    const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return horaRegex.test(hora);
  }

  /**
   * Obtiene el color del badge según el estado
   */
  getEstadoColor(estado: EstadoTraslado): string {
    switch (estado) {
      case EstadoTraslado.PENDIENTE:
        return 'warning';
      case EstadoTraslado.INICIADO:
        return 'primary';
      case EstadoTraslado.FINALIZADO:
        return 'success';
      case EstadoTraslado.CANCELADO:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Obtiene el texto en español del estado
   */
  getEstadoTexto(estado: EstadoTraslado): string {
    switch (estado) {
      case EstadoTraslado.PENDIENTE:
        return 'Pendiente';
      case EstadoTraslado.INICIADO:
        return 'En curso';
      case EstadoTraslado.FINALIZADO:
        return 'Finalizado';
      case EstadoTraslado.CANCELADO:
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  }

  //Conexion GoogleMaps
  calcularTiempoReal(trasladoId: number): Observable<GoogleMapsResponse> {
  return this.http.post<GoogleMapsResponse>(`${this.apiUrl}/${trasladoId}/calcular-tiempo`, {});
}


}