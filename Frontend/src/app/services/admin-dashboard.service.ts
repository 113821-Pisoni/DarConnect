// src/app/services/admin-dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChoferService } from './chofer.service';
import { PacientesService } from './pacientes.service';
import { ObrasSocialesService } from './obras-sociales.service';
import { TrasladoService } from './traslado.service';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private apiUrl = 'http://localhost:8080/admin';

  constructor(
    private http: HttpClient,
    private choferService: ChoferService,
    private pacientesService: PacientesService,
    private obrasSocialesService: ObrasSocialesService,
    private trasladoService: TrasladoService
  ) {}

  /**
   * Obtiene estadísticas globales del sistema
   */
  getEstadisticasGlobales(periodo: string = 'semana'): Observable<any> {
    const params = new HttpParams().set('periodo', periodo);
    return this.http.get(`${this.apiUrl}/estadisticas-globales`, { params });
  }

  /**
   * Obtiene estadísticas por chofer
   */
  getEstadisticasPorChofer(periodo: string = 'semana'): Observable<any> {
    const params = new HttpParams().set('periodo', periodo);
    return this.http.get(`${this.apiUrl}/traslados-por-chofer`, { params });
  }

  /**
   * Combina datos de múltiples servicios para el dashboard
   */
  getDashboardCompleto(periodo: string = 'semana'): Observable<any> {
    return forkJoin({
      estadisticasGlobales: this.getEstadisticasGlobales(periodo),
      estadisticasPorChofer: this.getEstadisticasPorChofer(periodo),
      choferes: this.choferService.getAllChoferes(),
      pacientes: this.pacientesService.getPacientes(),
      obrasSociales: this.obrasSocialesService.getObrasSociales()
    }).pipe(
      map(data => ({
        ...data,
        periodo,
        timestamp: new Date()
      }))
    );
  }

  /**
   * Obtiene opciones para filtros
   */
  getOpcionesFiltros(): Observable<any> {
    return forkJoin({
      choferes: this.choferService.getAllChoferes(),
      pacientes: this.pacientesService.getPacientesActivos(),
      obrasSociales: this.obrasSocialesService.getObrasSocialesActivas()
    }).pipe(
      map(data => ({
        choferes: data.choferes.map(c => ({
          id: c.id,
          nombre: `${c.nombre} ${c.apellido}`,
          activo: c.activo || true
        })),
        pacientes: data.pacientes.map(p => ({
          id: p.id,
          nombre: `${p.nombre} ${p.apellido}`,
          activo: p.activo
        })),
        obrasSociales: data.obrasSociales.map(os => ({
          id: os.id,
          descripcion: os.descripcion,
          activo: os.activo
        }))
      }))
    );
  }

  /**
   * Obtiene traslados del día para admin con filtros
   */
  getTrasladosDelDiaConFiltros(filtros: any): Observable<any> {
    return this.trasladoService.getTrasladosDelDiaAdmin(filtros.fecha, filtros.estado);
  }

  /**
   * Helpers para fechas
   */
  getFechasParaPeriodo(periodo: string): { fechaInicio: string; fechaFin: string } {
    const hoy = new Date();
    const fechaFin = this.formatDate(hoy);
    let fechaInicio: string;

    switch (periodo) {
      case 'hoy':
        fechaInicio = fechaFin;
        break;
      case 'semana':
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1);
        fechaInicio = this.formatDate(inicioSemana);
        break;
      case 'mes':
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fechaInicio = this.formatDate(inicioMes);
        break;
      case 'año':
        const inicioAño = new Date(hoy.getFullYear(), 0, 1);
        fechaInicio = this.formatDate(inicioAño);
        break;
      default:
        const inicioDefault = new Date(hoy);
        inicioDefault.setDate(hoy.getDate() - 7);
        fechaInicio = this.formatDate(inicioDefault);
    }

    return { fechaInicio, fechaFin };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}