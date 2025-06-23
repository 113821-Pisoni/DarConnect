// src/app/services/historico-traslado.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoricoFiltrosDTO } from '../interfaces/historico-traslado.interface';

@Injectable({
  providedIn: 'root'
})
export class HistoricoTrasladoService {
  private apiUrl = 'http://localhost:8080/historico-traslados';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene el histórico de traslados con filtros y paginación
   */
  getHistoricoTraslados(filtros: HistoricoFiltrosDTO = {}): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.fechaInicio) {
      params = params.set('fechaInicio', filtros.fechaInicio);
    }
    
    if (filtros.fechaFin) {
      params = params.set('fechaFin', filtros.fechaFin);
    }
    
    if (filtros.choferId) {
      params = params.set('choferId', filtros.choferId.toString());
    }
    
    if (filtros.pacienteId) {
      params = params.set('pacienteId', filtros.pacienteId.toString());
    }
    
    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }
    
    if (filtros.page !== undefined) {
      params = params.set('page', filtros.page.toString());
    }
    
    if (filtros.size !== undefined) {
      params = params.set('size', filtros.size.toString());
    }
    
    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Obtiene estadísticas del histórico para el período especificado
   */
  getEstadisticasHistorico(fechaInicio?: string, fechaFin?: string): Observable<any> {
    let params = new HttpParams();
    
    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }
    
    return this.http.get<any>(`${this.apiUrl}/estadisticas`, { params });
  }

  /**
   * Formatea una fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return '--';
    
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '--';
    }
  }

  /**
   * Formatea fecha y hora para mostrar
   */
  formatearFechaHora(fechaHora: string): string {
    if (!fechaHora) return '--';
    
    try {
      const date = new Date(fechaHora);
      return date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '--';
    }
  }
}