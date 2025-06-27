// src/app/pages/admin/historico-traslados/historico-traslados.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoricoTrasladoService } from '../../../services/historico.service';
import { ChoferService } from '../../../services/chofer.service';
import { PacientesService } from '../../../services/pacientes.service';
import { TrasladoService } from '../../../services/traslado.service';
import { HistoricoFiltrosDTO } from '../../../interfaces/historico-traslado.interface';
import { ChoferData } from '../../../interfaces/chofer.interface';
import { Paciente } from '../../../interfaces/paciente.interface';
import { EstadoTraslado } from '../../../interfaces/traslado.interface';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-historico-traslados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.css']
})
export class HistoricoTrasladosComponent implements OnInit {

  // Signals para datos
  historicos = signal<any[]>([]);
  choferes = signal<ChoferData[]>([]);
  pacientes = signal<Paciente[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // Signals para paginación
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = signal(20);
  
  // Signals para filtros
  filtroEstado = signal<EstadoTraslado | ''>('');
  filtroChofer = signal<number | ''>('');
  filtroPaciente = signal<number | ''>('');
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');

  // Estados del enum para el selector
  estadosTraslado = Object.values(EstadoTraslado);

  // Computed para las estadísticas
  estadisticas = computed(() => {
    const historicos_data = this.historicos();
    const total = historicos_data.length;
    const finalizados = historicos_data.filter(h => h.estado === 'FINALIZADO').length;
    const cancelados = historicos_data.filter(h => h.estado === 'CANCELADO').length;
    const iniciados = historicos_data.filter(h => h.estado === 'INICIADO').length;
    const pendientes = historicos_data.filter(h => h.estado === 'PENDIENTE').length;
    
    return { total, finalizados, cancelados, iniciados, pendientes };
  });

  // Computed para mostrar si hay filtros activos
  filtrosActivos = computed(() => {
    return !!(this.filtroEstado() || this.filtroChofer() || this.filtroPaciente() || 
              this.fechaInicio() || this.fechaFin());
  });

  constructor(
    private historicoService: HistoricoTrasladoService,
    private choferService: ChoferService,
    private pacientesService: PacientesService,
    private trasladoService: TrasladoService
  ) {}

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    this.loading.set(true);
    this.error.set(null);

    // Cargar datos en paralelo
    Promise.all([
      this.cargarChoferes(),
      this.cargarPacientes(),
      this.cargarHistoricos()
    ]).finally(() => {
      this.loading.set(false);
    });
  }

  private cargarChoferes(): Promise<void> {
    return new Promise((resolve) => {
      this.choferService.getAllChoferes().subscribe({
        next: (choferes) => {
          // Cargar TODOS los choferes para el filtro, no solo activos
          this.choferes.set(choferes); 
          resolve();
        },
        error: (err) => {
          resolve(); 
        }
      });
    });
  }

  private cargarPacientes(): Promise<void> {
    return new Promise((resolve) => {
      this.pacientesService.getPacientesActivos().subscribe({
        next: (pacientes) => {
          this.pacientes.set(pacientes);
          resolve();
        },
        error: (err) => {
          resolve();
        }
      });
    });
  }

  private cargarHistoricos(): Promise<void> {
    return new Promise((resolve, reject) => {
      const filtros = this.construirFiltros();
      
      this.historicoService.getHistoricoTraslados(filtros).subscribe({
        next: (response: any) => {
          
          this.historicos.set(response.content || []);
          this.totalPages.set(response.totalPages || 0);
          this.totalElements.set(response.totalElements || 0);
          this.currentPage.set(response.number || 0);
          
          resolve();
        },
        error: (err) => {
          this.error.set('Error al cargar el histórico de traslados');
          reject(err);
        }
      });
    });
  }

  private construirFiltros(): HistoricoFiltrosDTO {
    const filtros: HistoricoFiltrosDTO = {
      page: this.currentPage(),
      size: this.pageSize()
    };

    if (this.filtroEstado()) {
      filtros.estado = this.filtroEstado() as EstadoTraslado;
    }

    if (this.filtroChofer()) {
      filtros.choferId = this.filtroChofer() as number;
    }

    if (this.filtroPaciente()) {
      filtros.pacienteId = this.filtroPaciente() as number;
    }

    if (this.fechaInicio()) {
      filtros.fechaInicio = this.fechaInicio();
    }

    if (this.fechaFin()) {
      filtros.fechaFin = this.fechaFin();
    }

    return filtros;
  }

  // Métodos para filtros
  aplicarFiltros() {
    this.currentPage.set(0); // Resetear a la primera página
    this.cargarHistoricos();
  }

  limpiarFiltros() {
    this.filtroEstado.set('');
    this.filtroChofer.set('');
    this.filtroPaciente.set('');
    this.fechaInicio.set('');
    this.fechaFin.set('');
    this.currentPage.set(0);
    this.cargarHistoricos();
  }

  // Método para cambiar página
  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPages()) {
      this.currentPage.set(nuevaPagina);
      this.cargarHistoricos();
    }
  }

  // Método para cambiar tamaño de página
  cambiarTamanoPagina(nuevoTamano: number) {
    this.pageSize.set(nuevoTamano);
    this.currentPage.set(0);
    this.cargarHistoricos();
  }

  // Métodos de utilidad
  getNombreChofer(historico: any): string {
    return historico.traslado?.agenda?.chofer ? 
      `${historico.traslado.agenda.chofer.nombre} ${historico.traslado.agenda.chofer.apellido}` : 
      'Desconocido';
  }

  getNombrePaciente(historico: any): string {
    return historico.traslado?.paciente ? 
      `${historico.traslado.paciente.nombre} ${historico.traslado.paciente.apellido}` : 
      'Desconocido';
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'warning';
      case 'INICIADO': return 'primary';
      case 'FINALIZADO': return 'success';
      case 'CANCELADO': return 'danger';
      default: return 'secondary';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'INICIADO': return 'En curso';
      case 'FINALIZADO': return 'Finalizado';
      case 'CANCELADO': return 'Cancelado';
      default: return 'Desconocido';
    }
  }

  formatearHora(hora: any): string {
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

  formatearFecha(fecha: string): string {
    return this.historicoService.formatearFecha(fecha);
  }

  formatearFechaHora(fechaHora: string): string {
    return this.historicoService.formatearFechaHora(fechaHora);
  }

  // Método para exportar datos 
  exportarDatos() {
    if (this.historicos().length === 0) {
      return;
    }

    // Preparar los datos para exportar
    const datosExport = this.historicos().map(historico => ({
      'Fecha/Hora Cambio': this.formatearFechaHora(historico.fechaHoraCambio),
      'Fecha Traslado': this.formatearFecha(historico.fechaTraslado),
      'Paciente': `${historico.traslado?.paciente?.nombre || ''} ${historico.traslado?.paciente?.apellido || ''}`.trim(),
      'DNI Paciente': historico.traslado?.paciente?.dni || '',
      'Silla de Ruedas': historico.traslado?.paciente?.sillaRueda ? 'Sí' : 'No',
      'Chofer': `${historico.traslado?.agenda?.chofer?.nombre || ''} ${historico.traslado?.agenda?.chofer?.apellido || ''}`.trim(),
      'DNI Chofer': historico.traslado?.agenda?.chofer?.dni || '',
      'Hora Programada': this.formatearHora(historico.traslado?.horaProgramada),
      'Estado': this.getEstadoTexto(historico.estado),
      'Motivo': historico.motivo || ''
    }));

    // Crear el libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(datosExport);
    const workbook = XLSX.utils.book_new();
    
    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Histórico Traslados');

    // Configurar el ancho de las columnas
    const columnWidths = [
      { wch: 18 }, // Fecha/Hora Cambio
      { wch: 15 }, // Fecha Traslado
      { wch: 25 }, // Paciente
      { wch: 12 }, // DNI Paciente
      { wch: 15 }, // Silla de Ruedas
      { wch: 25 }, // Chofer
      { wch: 12 }, // DNI Chofer
      { wch: 15 }, // Hora Programada
      { wch: 12 }, // Estado
      { wch: 30 }  // Motivo
    ];
    
    worksheet['!cols'] = columnWidths;

    // Generar nombre del archivo con fecha
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD
    const nombreArchivo = `historico-traslados-${fechaFormateada}.xlsx`;

    // Descargar el archivo
    XLSX.writeFile(workbook, nombreArchivo);
    
  }

  // Método alternativo con más opciones de formato
  exportarDatosAvanzado() {
    if (this.historicos().length === 0) {
      return;
    }

    // Preparar datos con información adicional
    const datosExport = this.historicos().map(historico => ({
      'Fecha/Hora Cambio': this.formatearFechaHora(historico.fechaHoraCambio),
      'Fecha Traslado': this.formatearFecha(historico.fechaTraslado),
      'Paciente': `${historico.traslado?.paciente?.nombre || ''} ${historico.traslado?.paciente?.apellido || ''}`.trim(),
      'DNI Paciente': historico.traslado?.paciente?.dni || '',
      'Silla de Ruedas': historico.traslado?.paciente?.sillaRueda ? 'Sí' : 'No',
      'Chofer': `${historico.traslado?.agenda?.chofer?.nombre || ''} ${historico.traslado?.agenda?.chofer?.apellido || ''}`.trim(),
      'DNI Chofer': historico.traslado?.agenda?.chofer?.dni || '',
      'Hora Programada': this.formatearHora(historico.traslado?.horaProgramada),
      'Estado': this.getEstadoTexto(historico.estado),
      'Motivo': historico.motivo || ''
    }));

    // Crear hoja con los datos
    const worksheet = XLSX.utils.json_to_sheet(datosExport);
    
    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new();
    
    // Agregar hoja de datos
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    // Crear hoja de resumen/estadísticas
    const stats = this.estadisticas();
    const resumenData = [
      ['Resumen del Histórico de Traslados', ''],
      ['', ''],
      ['Total de registros', stats.total],
      ['Finalizados', stats.finalizados],
      ['Cancelados', stats.cancelados],
      ['En curso', stats.iniciados],
      ['Pendientes', stats.pendientes],
      ['', ''],
      ['Fecha de exportación', new Date().toLocaleDateString()],
      ['Hora de exportación', new Date().toLocaleTimeString()]
    ];

    const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen');

    // Configurar anchos de columna para la hoja de datos
    worksheet['!cols'] = [
      { wch: 18 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 15 },
      { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 30 }
    ];

    // Configurar anchos para la hoja de resumen
    resumenSheet['!cols'] = [{ wch: 25 }, { wch: 15 }];

    // Generar nombre del archivo
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toISOString().split('T')[0];
    let nombreArchivo = `historico-traslados-${fechaFormateada}`;
    
    // Agregar filtros aplicados al nombre si existen
    if (this.filtrosActivos()) {
      nombreArchivo += '-filtrado';
    }
    
    nombreArchivo += '.xlsx';

    // Descargar
    XLSX.writeFile(workbook, nombreArchivo);
  }

  // Generar array de páginas para la paginación
  getPaginas(): number[] {
    const totalPaginas = this.totalPages();
    const paginaActual = this.currentPage();
    const páginas: number[] = [];
    
    // Mostrar máximo 5 páginas
    const inicio = Math.max(0, paginaActual - 2);
    const fin = Math.min(totalPaginas - 1, inicio + 4);
    
    for (let i = inicio; i <= fin; i++) {
      páginas.push(i);
    }
    
    return páginas;
  }
}