import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacientesService } from '../../../services/pacientes.service';
import { ObrasSocialesService } from '../../../services/obras-sociales.service';
import { ObraSocial } from '../../../interfaces/obraSocial.interface';
import { Paciente, PacienteCreateDTO, PacienteUpdateDTO } from '../../../interfaces/paciente.interface';
import { PacientesModalComponent, ModalMode } from './paciente-modal/paciente-modal.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, PacientesModalComponent],
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css']
})
export class PacientesComponent implements OnInit {
  
  @ViewChild(PacientesModalComponent) modal!: PacientesModalComponent;

  // Signals
  pacientes = signal<Paciente[]>([]);
  obrasSociales = signal<ObraSocial[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filtroActivo = signal('TODOS');
  
  // Modal signals
  modalOpen = signal(false);
  modalMode = signal<ModalMode>('create');
  selectedPaciente = signal<Paciente | null>(null);

  // Computed para identificar la obra social "Sin obra social"
  obraSocialSinCobertura = computed(() => {
    return this.obrasSociales().find(os => 
      os.descripcion.toLowerCase().includes('sin obra social') ||
      os.descripcion.toLowerCase().includes('particular') ||
      os.descripcion.toLowerCase().includes('sin cobertura')
    );
  });

  // Computed
  pacientesFiltrados = computed(() => {
    const filtro = this.filtroActivo();
    if (filtro === 'TODOS') {
      return this.pacientes();
    }
    return this.pacientes().filter(p => {
      if (filtro === 'ACTIVOS') return p.activo;
      if (filtro === 'INACTIVOS') return !p.activo;
      if (filtro === 'SILLA_RUEDAS') return p.sillaRueda;
      if (filtro === 'CON_OBRA_SOCIAL') {
        // Pacientes que tienen obra social diferente a "Sin obra social"
        const sinObraSocial = this.obraSocialSinCobertura();
        return p.idObraSocial != null && p.idObraSocial !== sinObraSocial?.id;
      }
      if (filtro === 'SIN_OBRA_SOCIAL') {
        // Pacientes que tienen la obra social "Sin obra social"
        const sinObraSocial = this.obraSocialSinCobertura();
        return p.idObraSocial === sinObraSocial?.id;
      }
      return true;
    });
  });

  estadisticas = computed(() => {
    const total = this.pacientes().length;
    const activos = this.pacientes().filter(p => p.activo).length;
    const inactivos = total - activos;
    const conSillaRuedas = this.pacientes().filter(p => p.sillaRueda).length;
    
    // Calcular pacientes con y sin obra social
    const sinObraSocial = this.obraSocialSinCobertura();
    const conObraSocial = this.pacientes().filter(p => 
      p.idObraSocial != null && p.idObraSocial !== sinObraSocial?.id
    ).length;
    const sinObraSocialCount = this.pacientes().filter(p => 
      p.idObraSocial === sinObraSocial?.id
    ).length;
    
    return { 
      totalPacientes: total, 
      pacientesActivos: activos, 
      pacientesInactivos: inactivos, 
      conSillaRuedas, 
      conObraSocial,
      sinObraSocial: sinObraSocialCount
    };
  });

  existingDnis = computed(() => {
    return this.pacientes().map(p => p.dni);
  });

  constructor(
    private pacientesService: PacientesService,
    private obrasSocialesService: ObrasSocialesService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);
    this.error.set(null);
    
    // Cargar pacientes y obras sociales en paralelo
    Promise.all([
      this.cargarPacientes(),
      this.cargarObrasSociales()
    ]).finally(() => {
      this.loading.set(false);
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
          console.error('Error al cargar pacientes:', err);
          this.error.set('Error al cargar los pacientes');
          reject(err);
        }
      });
    });
  }

  private cargarObrasSociales(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.obrasSocialesService.getObrasSocialesActivas().subscribe({
        next: (obrasSociales) => {
          this.obrasSociales.set(obrasSociales);
          resolve();
        },
        error: (err) => {
          console.warn('Error al cargar obras sociales:', err);
          // No bloqueamos la carga si fallan las obras sociales
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
    this.modalMode.set('create');
    this.selectedPaciente.set(null);
    this.modalOpen.set(true);
  }

  abrirModalEditar(paciente: Paciente) {
    this.modalMode.set('edit');
    this.selectedPaciente.set(paciente);
    this.modalOpen.set(true);
  }

  cerrarModal() {
    this.modalOpen.set(false);
  }

  onSavePaciente(data: PacienteCreateDTO | PacienteUpdateDTO) {
    if (this.modalMode() === 'create') {
      this.crearPaciente(data as PacienteCreateDTO);
    } else {
      this.actualizarPaciente(data as PacienteUpdateDTO);
    }
  }

  private crearPaciente(pacienteData: PacienteCreateDTO) {
    this.pacientesService.createPaciente(pacienteData).subscribe({
      next: (pacienteCreado) => {
        this.modal.finishLoading();
        this.cerrarModal();
        
        Swal.fire({
          title: '¡Paciente Creado!',
          text: 'El paciente ha sido creado exitosamente',
          icon: 'success',
          confirmButtonColor: '#198754'
        });
        
        this.cargarPacientes();
      },
      error: (err) => {
        console.error('Error al crear paciente:', err);
        this.modal.finishLoading();
        
        let mensaje = 'No se pudo crear el paciente. Intente nuevamente.';
        if (err.status === 400 && err.error?.message?.includes('DNI')) {
          mensaje = 'Ya existe un paciente con ese DNI.';
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

  private actualizarPaciente(pacienteData: PacienteUpdateDTO) {
    if (!pacienteData.id) return;
    
    this.pacientesService.updatePaciente(pacienteData.id, pacienteData).subscribe({
      next: (pacienteActualizado) => {
        this.modal.finishLoading();
        this.cerrarModal();
        
        Swal.fire({
          title: '¡Paciente Actualizado!',
          text: 'El paciente ha sido actualizado exitosamente',
          icon: 'success',
          confirmButtonColor: '#198754'
        });
        
        this.cargarPacientes();
      },
      error: (err) => {
        console.error('Error al actualizar paciente:', err);
        this.modal.finishLoading();
        
        let mensaje = 'No se pudo actualizar el paciente. Intente nuevamente.';
        if (err.status === 400 && err.error?.message?.includes('DNI')) {
          mensaje = 'Ya existe un paciente con ese DNI.';
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

  async toggleEstado(paciente: Paciente) {
    const accion = paciente.activo ? 'desactivar' : 'activar';
    const result = await Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} paciente?`,
      text: `¿Está seguro que desea ${accion} al paciente ${paciente.nombre} ${paciente.apellido}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: paciente.activo ? '#dc3545' : '#198754'
    });

    if (result.isConfirmed) {
      this.pacientesService.toggleEstadoPaciente(paciente.id).subscribe({
        next: () => {
          Swal.fire({
            title: `¡Paciente ${accion === 'activar' ? 'Activado' : 'Desactivado'}!`,
            text: `El paciente ha sido ${accion === 'activar' ? 'activado' : 'desactivado'} exitosamente`,
            icon: 'success',
            confirmButtonColor: '#198754'
          });
          this.cargarPacientes();
        },
        error: (err) => {
          console.error('Error al cambiar estado:', err);
          Swal.fire({
            title: 'Error',
            text: `No se pudo ${accion} el paciente, verifique que no tenga traslados activos`,
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
      });
    }
  }

  getNombreObraSocial(idObraSocial: number | null): string {
    if (!idObraSocial) return 'Sin obra social';
    const obraSocial = this.obrasSociales().find(os => os.id === idObraSocial);
    return obraSocial ? obraSocial.descripcion : 'Desconocida';
  }

  getEstadoBadgeClass(activo: boolean): string {
    return activo ? 'badge bg-success' : 'badge bg-secondary';
  }

  // Método helper para verificar si un paciente tiene obra social real
  tieneObraSocialReal(paciente: Paciente): boolean {
    const sinObraSocial = this.obraSocialSinCobertura();
    return paciente.idObraSocial != null && paciente.idObraSocial !== sinObraSocial?.id;
  }

  debugPacientes() {
    console.log('=== DEBUG PACIENTES ===');
    console.log('Total pacientes:', this.pacientes().length);
    console.log('Pacientes:', this.pacientes());
    console.log('Estadísticas:', this.estadisticas());
    console.log('Obra social "Sin cobertura":', this.obraSocialSinCobertura());
    console.log('=====================');
  }
}