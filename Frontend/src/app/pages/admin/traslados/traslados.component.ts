// src/app/pages/admin/traslados/traslados.component.ts (COMPLETO)
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrasladoService } from '../../../services/traslado.service';
import { AgendaService } from '../../../services/agenda.service';
import { PacientesService } from '../../../services/pacientes.service';
import { TrasladoDTO, TrasladoCreateDTO, TrasladoUpdateDTO, EstadoTraslado, EstadisticasTraslados, DiaSemana } from '../../../interfaces/traslado.interface';
import { Agenda } from '../../../interfaces/agenda.interface';
import { Paciente } from '../../../interfaces/paciente.interface';
import { SearchSelectComponent, SearchSelectOption  } from '../../search-select/search-select/search-select.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-traslados',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchSelectComponent],
  templateUrl: './traslados.component.html',
  styleUrls: ['./traslados.component.css']
})
export class TrasladosComponent implements OnInit {
  
  // Signals originales
  traslados = signal<TrasladoDTO[]>([]);
  agendas = signal<Agenda[]>([]);
  pacientes = signal<Paciente[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filtroActivo = signal('TODOS');
  filtroPaciente = signal('');
  filtroChofer = signal('');

  // NUEVOS signals para filtros con SearchSelect
  filtroPacienteSeleccionado = signal<string | number>('');
  filtroChoferSeleccionado = signal<string | number>('');

  // Días de la semana
  diasSemana = signal<DiaSemana[]>([
    { id: 1, nombre: 'Lunes', seleccionado: false },
    { id: 2, nombre: 'Martes', seleccionado: false },
    { id: 3, nombre: 'Miércoles', seleccionado: false },
    { id: 4, nombre: 'Jueves', seleccionado: false },
    { id: 5, nombre: 'Viernes', seleccionado: false },
    { id: 6, nombre: 'Sábado', seleccionado: false },
    { id: 7, nombre: 'Domingo', seleccionado: false }
  ]);

  // NUEVOS computed para opciones de SearchSelect
  pacientesOptions = computed<SearchSelectOption[]>(() => {
    return this.pacientes()
      .filter(p => p.activo)
      .map(p => ({
        id: p.id,
        label: `${p.nombre} ${p.apellido}`,
        subtitle: `DNI: ${p.dni}`
      }));
  });

  choferesOptions = computed<SearchSelectOption[]>(() => {
    return this.agendas()
      .filter(a => a.activo)
      .map(a => ({
        id: a.id,
        label: `${a.nombreChofer} ${a.apellidoChofer}`,
        subtitle: `Agenda ID: ${a.id}`
      }));
  });

  // Computed MODIFICADO para usar los nuevos filtros
  trasladosFiltrados = computed(() => {
    const filtroEstado = this.filtroActivo();
    const filtroPac = this.filtroPaciente().toLowerCase();
    const filtroCho = this.filtroChofer().toLowerCase();
    
    // NUEVOS filtros de selección
    const pacienteSeleccionado = this.filtroPacienteSeleccionado();
    const choferSeleccionado = this.filtroChoferSeleccionado();
    
    return this.traslados().filter(traslado => {
      // Filtro por estado
      let cumpleEstado = true;
      if (filtroEstado === 'ACTIVOS') cumpleEstado = traslado.activo;
      if (filtroEstado === 'INACTIVOS') cumpleEstado = !traslado.activo;
      
      // Filtro por paciente - PRIORIZAR SearchSelect
      let cumplePaciente = true;
      if (pacienteSeleccionado) {
        cumplePaciente = traslado.idPaciente === pacienteSeleccionado;
      } else if (filtroPac) {
        // Filtro de texto como fallback
        const nombrePaciente = this.getNombrePaciente(traslado.idPaciente).toLowerCase();
        cumplePaciente = nombrePaciente.includes(filtroPac);
      }
      
      // Filtro por chofer - PRIORIZAR SearchSelect
      let cumpleChofer = true;
      if (choferSeleccionado) {
        cumpleChofer = traslado.idAgenda === choferSeleccionado;
      } else if (filtroCho) {
        // Filtro de texto como fallback
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

  // Computed para filtros de dropdowns (solo para modales)
  agendasFiltradas = computed(() => {
    return this.agendas().filter(a => a.activo);
  });

  pacientesFiltradosModal = computed(() => {
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
          console.log('Traslados recibidos:', traslados);
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

  // NUEVOS métodos para manejar SearchSelect
  onPacienteSelectionChange(pacienteId: string | number): void {
    this.filtroPacienteSeleccionado.set(pacienteId);
    // Limpiar filtro de texto al seleccionar
    if (pacienteId) {
      this.filtroPaciente.set('');
    }
    console.log('Paciente seleccionado:', pacienteId);
  }

  onChoferSelectionChange(choferId: string | number): void {
    this.filtroChoferSeleccionado.set(choferId);
    // Limpiar filtro de texto al seleccionar
    if (choferId) {
      this.filtroChofer.set('');
    }
    console.log('Chofer seleccionado:', choferId);
  }

  cambiarFiltro(filtro: string) {
    this.filtroActivo.set(filtro);
  }

  async crearTraslado() {
    const agendasDisponibles = this.agendasFiltradas();
    const pacientesDisponibles = this.pacientesFiltradosModal();
    
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

    // Reset días
    this.resetDiasSemana();

    const opcionesAgendas = agendasDisponibles
      .map(agenda => `<option value="${agenda.id}">Agenda de ${agenda.nombreChofer} ${agenda.apellidoChofer}</option>`)
      .join('');

    const opcionesPacientes = pacientesDisponibles
      .map(paciente => `<option value="${paciente.id}">${paciente.nombre} ${paciente.apellido} - DNI: ${paciente.dni}</option>`)
      .join('');

    const { value: formValues } = await Swal.fire({
      title: 'Nuevo Traslado',
      html: `
        <div class="text-start mt-3">
          <div class="row">
            <div class="col-6">
              <div class="form-floating mb-3">
                <select class="form-select" id="agenda">
                  <option value="">Seleccionar agenda...</option>
                  ${opcionesAgendas}
                </select>
                <label for="agenda"><i class="bi bi-calendar-check me-2"></i>Agenda/Chofer</label>
              </div>
            </div>
            <div class="col-6">
              <div class="form-floating mb-3">
                <select class="form-select" id="paciente">
                  <option value="">Seleccionar paciente...</option>
                  ${opcionesPacientes}
                </select>
                <label for="paciente"><i class="bi bi-person-heart me-2"></i>Paciente</label>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-6">
              <div class="form-floating mb-3">
                <input type="text" class="form-control" id="direccionOrigen" placeholder="Dirección origen">
                <label for="direccionOrigen"><i class="bi bi-geo-alt me-2"></i>Dirección Origen</label>
              </div>
            </div>
            <div class="col-6">
              <div class="form-floating mb-3">
                <input type="text" class="form-control" id="direccionDestino" placeholder="Dirección destino">
                <label for="direccionDestino"><i class="bi bi-geo-alt-fill me-2"></i>Dirección Destino</label>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-4">
              <div class="form-floating mb-3">
                <input type="time" class="form-control" id="hora" placeholder="Hora">
                <label for="hora"><i class="bi bi-clock me-2"></i>Hora</label>
              </div>
            </div>
            <div class="col-4">
              <div class="form-floating mb-3">
                <input type="date" class="form-control" id="fechaInicio" placeholder="Fecha inicio">
                <label for="fechaInicio"><i class="bi bi-calendar-plus me-2"></i>Fecha Inicio</label>
              </div>
            </div>
            <div class="col-4">
              <div class="form-floating mb-3">
                <input type="date" class="form-control" id="fechaFin" placeholder="Fecha fin (opcional)">
                <label for="fechaFin"><i class="bi bi-calendar-x me-2"></i>Fecha Fin</label>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label"><i class="bi bi-calendar-week me-2"></i>Días de la semana</label>
            <div class="row">
              <div class="col-6 col-md-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="dia1">
                  <label class="form-check-label" for="dia1">Lunes</label>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="dia2">
                  <label class="form-check-label" for="dia2">Martes</label>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="dia3">
                  <label class="form-check-label" for="dia3">Miércoles</label>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="dia4">
                  <label class="form-check-label" for="dia4">Jueves</label>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="dia5">
                  <label class="form-check-label" for="dia5">Viernes</label>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="dia6">
                  <label class="form-check-label" for="dia6">Sábado</label>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="dia7">
                  <label class="form-check-label" for="dia7">Domingo</label>
                </div>
              </div>
            </div>
          </div>

          <div class="form-floating mb-3">
            <textarea class="form-control" id="observaciones" placeholder="Observaciones" style="height: 80px;"></textarea>
            <label for="observaciones"><i class="bi bi-chat-text me-2"></i>Observaciones (opcional)</label>
          </div>
        </div>
      `,
      width: '800px',
      showCancelButton: true,
      confirmButtonText: '<i class="bi bi-check me-1"></i>Crear',
      cancelButtonText: '<i class="bi bi-x me-1"></i>Cancelar',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const agenda = (document.getElementById('agenda') as HTMLSelectElement).value;
        const paciente = (document.getElementById('paciente') as HTMLSelectElement).value;
        const direccionOrigen = (document.getElementById('direccionOrigen') as HTMLInputElement).value.trim();
        const direccionDestino = (document.getElementById('direccionDestino') as HTMLInputElement).value.trim();
        const hora = (document.getElementById('hora') as HTMLInputElement).value;
        const fechaInicio = (document.getElementById('fechaInicio') as HTMLInputElement).value;
        const fechaFin = (document.getElementById('fechaFin') as HTMLInputElement).value;
        const observaciones = (document.getElementById('observaciones') as HTMLTextAreaElement).value.trim();

        // Validaciones
        if (!agenda) {
          Swal.showValidationMessage('Debe seleccionar una agenda');
          return false;
        }
        if (!paciente) {
          Swal.showValidationMessage('Debe seleccionar un paciente');
          return false;
        }
        if (!direccionOrigen) {
          Swal.showValidationMessage('La dirección de origen es obligatoria');
          return false;
        }
        if (!direccionDestino) {
          Swal.showValidationMessage('La dirección de destino es obligatoria');
          return false;
        }
        if (!hora) {
          Swal.showValidationMessage('La hora es obligatoria');
          return false;
        }
        if (!fechaInicio) {
          Swal.showValidationMessage('La fecha de inicio es obligatoria');
          return false;
        }

        // Validar días seleccionados
        const diasSeleccionados = [];
        for (let i = 1; i <= 7; i++) {
          const checkbox = document.getElementById(`dia${i}`) as HTMLInputElement;
          if (checkbox.checked) {
            diasSeleccionados.push(i);
          }
        }

        if (diasSeleccionados.length === 0) {
          Swal.showValidationMessage('Debe seleccionar al menos un día de la semana');
          return false;
        }

        // Validar fecha fin mayor a fecha inicio
        if (fechaFin && fechaFin <= fechaInicio) {
          Swal.showValidationMessage('La fecha de fin debe ser posterior a la fecha de inicio');
          return false;
        }

        return { 
          idAgenda: parseInt(agenda),
          idPaciente: parseInt(paciente),
          direccionOrigen,
          direccionDestino,
          horaProgramada: hora + ':00', // Agregar segundos
          diasSemana: diasSeleccionados.join(','),
          fechaInicio,
          fechaFin: fechaFin || undefined,
          observaciones: observaciones || undefined
        };
      }
    });

    if (formValues) {
      this.trasladoService.createTraslado(formValues).subscribe({
        next: (trasladoCreado) => {
          console.log('Traslado creado:', trasladoCreado);
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
  }

  async editarTraslado(traslado: TrasladoDTO) {
    // Similar al crear pero pre-llenando valores
    // Por simplicidad, mostrar mensaje de implementación
    Swal.fire({
      title: 'Función en desarrollo',
      text: 'La edición de traslados estará disponible próximamente',
      icon: 'info',
      confirmButtonColor: '#3b82f6'
    });
  }

  async toggleEstado(traslado: TrasladoDTO) {
    const accion = traslado.activo ? 'desactivar' : 'activar';
    const result = await Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} traslado?`,
      text: `¿Está seguro que desea ${accion} este traslado?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: traslado.activo ? '#dc3545' : '#198754'
    });

    if (result.isConfirmed) {
      this.trasladoService.updateTraslado(traslado.id, { activo: !traslado.activo }).subscribe({
        next: () => {
          Swal.fire({
            title: `¡Traslado ${accion === 'activar' ? 'Activado' : 'Desactivado'}!`,
            text: `El traslado ha sido ${accion === 'activar' ? 'activado' : 'desactivado'} exitosamente`,
            icon: 'success',
            confirmButtonColor: '#198754'
          });
          this.cargarTraslados();
        },
        error: (err) => {
          console.error('Error al cambiar estado:', err);
          Swal.fire({
            title: 'Error',
            text: `No se pudo ${accion} el traslado`,
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
      });
    }
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

  // MÉTODO MODIFICADO para limpiar todos los filtros
  limpiarFiltros() {
    this.filtroPaciente.set('');
    this.filtroChofer.set('');
    this.filtroActivo.set('TODOS');
    
    // NUEVAS líneas para limpiar SearchSelect
    this.filtroPacienteSeleccionado.set('');
    this.filtroChoferSeleccionado.set('');
    
    console.log('Todos los filtros limpiados');
  }

  private resetDiasSemana() {
    this.diasSemana.update(dias => 
      dias.map(dia => ({ ...dia, seleccionado: false }))
    );
  }

  // Método para debugger ACTUALIZADO
  debugTraslados() {
    console.log('=== DEBUG TRASLADOS ===');
    console.log('Total traslados:', this.traslados().length);
    console.log('Traslados filtrados:', this.trasladosFiltrados().length);
    console.log('Filtros activos:', {
      estado: this.filtroActivo(),
      pacienteTexto: this.filtroPaciente(),
      choferTexto: this.filtroChofer(),
      pacienteSeleccionado: this.filtroPacienteSeleccionado(),
      choferSeleccionado: this.filtroChoferSeleccionado()
    });
    console.log('Opciones disponibles:', {
      pacientes: this.pacientesOptions().length,
      choferes: this.choferesOptions().length
    });
    console.log('======================');
  }
}