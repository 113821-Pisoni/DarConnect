import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrasladoService } from '../../../services/traslado.service';
import { AgendaService } from '../../../services/agenda.service';
import { PacientesService } from '../../../services/pacientes.service';
import { TrasladoDTO, TrasladoCreateDTO, TrasladoUpdateDTO } from '../../../interfaces/traslado.interface';
import { Agenda } from '../../../interfaces/agenda.interface';
import { Paciente } from '../../../interfaces/paciente.interface';
import { TrasladosModalComponent, ModalMode } from './traslado-modal/traslado-modal.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-traslados',
  standalone: true,
  imports: [CommonModule, FormsModule, TrasladosModalComponent],
  templateUrl: './traslados.component.html',
  styleUrls: ['./traslados.component.css']
})
export class TrasladosComponent implements OnInit {
  
  @ViewChild(TrasladosModalComponent) modal!: TrasladosModalComponent;

  // Signals
  traslados = signal<TrasladoDTO[]>([]);
  agendas = signal<Agenda[]>([]);
  pacientes = signal<Paciente[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filtroActivo = signal('TODOS');
  filtroPaciente = signal('');
  filtroChofer = signal('');
  
  // Modal signals
  modalOpen = signal(false);
  modalMode = signal<ModalMode>('create');
  selectedTraslado = signal<TrasladoDTO | null>(null);

  // Computed
  trasladosFiltrados = computed(() => {
    const filtroEstado = this.filtroActivo();
    const filtroPac = this.filtroPaciente().toLowerCase();
    const filtroCho = this.filtroChofer().toLowerCase();
    
    return this.traslados().filter(traslado => {
      // Filtro por estado
      let cumpleEstado = true;
      if (filtroEstado === 'ACTIVOS') cumpleEstado = traslado.activo;
      if (filtroEstado === 'INACTIVOS') cumpleEstado = !traslado.activo;
      
      // Filtro por paciente
      let cumplePaciente = true;
      if (filtroPac) {
        const nombrePaciente = this.getNombrePaciente(traslado.idPaciente).toLowerCase();
        cumplePaciente = nombrePaciente.includes(filtroPac);
      }
      
      // Filtro por chofer
      let cumpleChofer = true;
      if (filtroCho) {
        const nombreChofer = this.getNombreChofer(traslado.idAgenda).toLowerCase();
        cumpleChofer = nombreChofer.includes(filtroCho);
      }
      
      return cumpleEstado && cumplePaciente && cumpleChofer;
    });
  });

  estadisticas = computed(() => {
    const total = this.traslados().length;
    const activos = this.traslados().filter(t => t.activo).length;
    const inactivos = total - activos;
    
    return { 
      totalTraslados: total, 
      trasladosActivos: activos, 
      trasladosInactivos: inactivos,
      pendientes: 0,
      iniciados: 0,
      finalizados: 0,
      cancelados: 0
    };
  });

  // Computed para filtros de modales
  agendasActivas = computed(() => {
    return this.agendas().filter(a => a.activo);
  });

  pacientesActivos = computed(() => {
    return this.pacientes().filter(p => p.activo);
  });

  constructor(
    private trasladoService: TrasladoService,
    private agendaService: AgendaService,
    private pacientesService: PacientesService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);
    this.error.set(null);
    
    Promise.all([
      this.cargarTraslados(),
      this.cargarAgendas(),
      this.cargarPacientes()
    ]).finally(() => {
      this.loading.set(false);
    });
  }

  private cargarTraslados(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.trasladoService.getAllTraslados().subscribe({
        next: (traslados) => {
          this.traslados.set(traslados);
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar traslados:', err);
          this.error.set('Error al cargar los traslados');
          reject(err);
        }
      });
    });
  }

  private cargarAgendas(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.agendaService.getAgendas().subscribe({
        next: (agendas) => {
          this.agendas.set(agendas);
          resolve();
        },
        error: (err) => {
          console.warn('Error al cargar agendas:', err);
          resolve();
        }
      });
    });
  }

  private cargarPacientes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pacientesService.getPacientes().subscribe({
        next: (pacientes) => {
          this.pacientes.set(pacientes);
          resolve();
        },
        error: (err) => {
          console.warn('Error al cargar pacientes:', err);
          resolve();
        }
      });
    });
  }

  cambiarFiltro(filtro: string) {
    this.filtroActivo.set(filtro);
  }

  // Modal methods
  abrirModalCrear() {
    const agendasDisponibles = this.agendasActivas();
    const pacientesDisponibles = this.pacientesActivos();
    
    if (agendasDisponibles.length === 0) {
      Swal.fire({
        title: 'Sin agendas disponibles',
        text: 'No hay agendas activas disponibles.',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    if (pacientesDisponibles.length === 0) {
      Swal.fire({
        title: 'Sin pacientes disponibles',
        text: 'No hay pacientes activos disponibles.',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    this.modalMode.set('create');
    this.selectedTraslado.set(null);
    this.modalOpen.set(true);
  }

  abrirModalEditar(traslado: TrasladoDTO) {
    this.modalMode.set('edit');
    this.selectedTraslado.set(traslado);
    this.modalOpen.set(true);
  }

  cerrarModal() {
    this.modalOpen.set(false);
  }

  onSaveTraslado(data: TrasladoCreateDTO | TrasladoUpdateDTO) {
    if (this.modalMode() === 'create') {
      this.crearTraslado(data as TrasladoCreateDTO);
    } else {
      this.actualizarTraslado(data as TrasladoUpdateDTO);
    }
  }

  private crearTraslado(trasladoData: TrasladoCreateDTO) {
    this.trasladoService.createTraslado(trasladoData).subscribe({
      next: (trasladoCreado) => {
        this.modal.finishLoading();
        this.cerrarModal();
        
        Swal.fire({
          title: '¡Traslado Creado!',
          text: 'El traslado ha sido creado exitosamente',
          icon: 'success',
          confirmButtonColor: '#198754'
        });
        
        this.cargarTraslados();
      },
      error: (err) => {
        console.error('Error al crear traslado:', err);
        this.modal.finishLoading();
        
        let mensaje = 'No se pudo crear el traslado. Intente nuevamente.';
        if (err.status === 400) {
          if (err.error?.message?.includes('conflicto')) {
            mensaje = 'Ya existe un traslado en el mismo horario y día para esta agenda.';
          } else if (err.error?.message) {
            mensaje = err.error.message;
          }
        }
        
        Swal.fire({
          title: 'Error',
          text: mensaje,
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  private actualizarTraslado(trasladoData: TrasladoUpdateDTO) {
    if (!trasladoData.id) return;
    
    this.trasladoService.updateTraslado(trasladoData.id, trasladoData).subscribe({
      next: (trasladoActualizado) => {
        this.modal.finishLoading();
        this.cerrarModal();
        
        Swal.fire({
          title: '¡Traslado Actualizado!',
          text: 'El traslado ha sido actualizado exitosamente',
          icon: 'success',
          confirmButtonColor: '#198754'
        });
        
        this.cargarTraslados();
      },
      error: (err) => {
        console.error('Error al actualizar traslado:', err);
        this.modal.finishLoading();
        
        let mensaje = 'No se pudo actualizar el traslado. Intente nuevamente.';
        if (err.status === 400) {
          if (err.error?.message?.includes('conflicto')) {
            mensaje = 'Ya existe un traslado en el mismo horario y día para esta agenda.';
          } else if (err.error?.message) {
            mensaje = err.error.message;
          }
        }
        
        Swal.fire({
          title: 'Error',
          text: mensaje,
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  async darDeBaja(traslado: TrasladoDTO) {
    const result = await Swal.fire({
      title: '¿Dar de baja traslado?',
      text: `¿Está seguro que desea dar de baja este traslado? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, dar de baja',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    });

    if (result.isConfirmed) {
      this.trasladoService.updateTraslado(traslado.id, { activo: false }).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Traslado dado de baja!',
            text: 'El traslado ha sido dado de baja exitosamente',
            icon: 'success',
            confirmButtonColor: '#198754'
          });
          this.cargarTraslados();
        },
        error: (err) => {
          console.error('Error al dar de baja traslado:', err);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo dar de baja el traslado',
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
      });
    }
  }

  getEstadoBadgeClass(activo: boolean): string {
    return activo ? 'badge bg-success' : 'badge bg-secondary';
  }

  getNombreChofer(idAgenda: number): string {
    const agenda = this.agendas().find(a => a.id === idAgenda);
    return agenda ? `${agenda.nombreChofer} ${agenda.apellidoChofer}` : 'Chofer desconocido';
  }

  getNombrePaciente(idPaciente: number): string {
    const paciente = this.pacientes().find(p => p.id === idPaciente);
    return paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente desconocido';
  }

  getDiasTexto(diasSemana: string): string {
    return this.trasladoService.getNombresDias(diasSemana).join(', ');
  }

  formatearHora(hora: string): string {
    return this.trasladoService.formatearHora(hora);
  }

  limpiarFiltros() {
    this.filtroPaciente.set('');
    this.filtroChofer.set('');
    this.filtroActivo.set('TODOS');
  }

  // Método para verificar si el paciente necesita silla de ruedas
  necesitaSillaRuedas(idPaciente: number): boolean {
    const paciente = this.pacientes().find(p => p.id === idPaciente);
    return paciente?.sillaRueda || false;
  }

  debugTraslados() {
    console.log('=== DEBUG TRASLADOS ===');
    console.log('Total traslados:', this.traslados().length);
    console.log('Traslados filtrados:', this.trasladosFiltrados().length);
    console.log('Filtros activos:', {
      estado: this.filtroActivo(),
      paciente: this.filtroPaciente(),
      chofer: this.filtroChofer()
    });
    console.log('======================');
  }
}