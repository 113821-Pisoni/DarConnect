// src/app/pages/admin/pacientes/pacientes.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacientesService } from '../../../services/pacientes.service';
import { ObrasSocialesService } from '../../../services/obras-sociales.service';
import { ObraSocial } from '../../../interfaces/obraSocial.interface';
import { Paciente, PacienteCreateDTO, EstadisticasPacientes } from '../../../interfaces/paciente.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css']
})
export class PacientesComponent implements OnInit {
  obraSocialSeleccionada: number | '' = '';
  // Signals
  pacientes = signal<Paciente[]>([]);
  obrasSociales = signal<ObraSocial[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filtroActivo = signal('TODOS');

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
      if (filtro === 'CON_OBRA_SOCIAL') return p.idObraSocial != null;
      return true;
    });
  });

  estadisticas = computed(() => {
    const total = this.pacientes().length;
    const activos = this.pacientes().filter(p => p.activo).length;
    const inactivos = total - activos;
    const conSillaRuedas = this.pacientes().filter(p => p.sillaRueda).length;
    const conObraSocial = this.pacientes().filter(p => p.idObraSocial != null).length;
    
    return { 
      totalPacientes: total, 
      pacientesActivos: activos, 
      pacientesInactivos: inactivos, 
      conSillaRuedas, 
      conObraSocial 
    };
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
          console.log('Pacientes recibidos:', pacientes); // Para debug
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

  async crearPaciente() {
    const obrasSociales = this.obrasSociales();
    const opcionesObrasSociales = obrasSociales
      .map(os => `<option value="${os.id}">${os.descripcion}</option>`)
      .join('');
console.log(this.obrasSociales())
    const { value: formValues } = await Swal.fire({
      title: 'Nuevo Paciente',
      html: `
        <div class="text-start mt-3">
          <div class="row">
            <div class="col-6">
              <div class="form-floating mb-3">
                <input type="text" class="form-control" id="nombre" placeholder="Nombre">
                <label for="nombre"><i class="bi bi-person me-2"></i>Nombre</label>
              </div>
            </div>
            <div class="col-6">
              <div class="form-floating mb-3">
                <input type="text" class="form-control" id="apellido" placeholder="Apellido">
                <label for="apellido">Apellido</label>
              </div>
            </div>
          </div>
          
          <div class="row">
            <div class="col-6">
              <div class="form-floating mb-3">
                <input type="text" class="form-control" id="dni" placeholder="DNI">
                <label for="dni"><i class="bi bi-credit-card me-2"></i>DNI</label>
              </div>
            </div>
            <div class="col-6">
              <div class="form-floating mb-3">
                <input type="tel" class="form-control" id="telefono" placeholder="Teléfono">
                <label for="telefono"><i class="bi bi-telephone me-2"></i>Teléfono</label>
              </div>
            </div>
          </div>
          
          <div class="form-floating mb-3">
            <input type="email" class="form-control" id="email" placeholder="Email">
            <label for="email"><i class="bi bi-envelope me-2"></i>Email</label>
          </div>
          
          <div class="row">
            <div class="col-8">
              <div class="form-floating mb-3">
                <input type="text" class="form-control" id="direccion" placeholder="Dirección">
                <label for="direccion"><i class="bi bi-geo-alt me-2"></i>Dirección</label>
              </div>
            </div>
            <div class="col-4">
              <div class="form-floating mb-3">
                <input type="text" class="form-control" id="ciudad" placeholder="Ciudad">
                <label for="ciudad">Ciudad</label>
              </div>
            </div>
          </div>

           <div class="form-floating mb-3">
              <select class="form-select" id="obraSocial">
                <option value="">Sin obra social</option>
                ${this.obrasSociales().map(obra => 
                  `<option value="${obra.id}">${obra.descripcion}</option>`
                ).join('')}
              </select>
              <label for="obraSocial">
                <i class="bi bi-heart-pulse me-2"></i>Obra Social
              </label>
            </div>
          
          
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="sillaRueda">
            <label class="form-check-label" for="sillaRueda">
              <i class="bi bi-person-wheelchair me-2"></i>Requiere silla de ruedas
            </label>
          </div>

          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="activo" checked>
            <label class="form-check-label" for="activo">
              Paciente activo
            </label>
          </div>
        </div>
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: '<i class="bi bi-check me-1"></i>Crear',
      cancelButtonText: '<i class="bi bi-x me-1"></i>Cancelar',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value.trim();
        const apellido = (document.getElementById('apellido') as HTMLInputElement).value.trim();
        const dni = (document.getElementById('dni') as HTMLInputElement).value.trim();
        const telefono = (document.getElementById('telefono') as HTMLInputElement).value.trim();
        const email = (document.getElementById('email') as HTMLInputElement).value.trim();
        const direccion = (document.getElementById('direccion') as HTMLInputElement).value.trim();
        const ciudad = (document.getElementById('ciudad') as HTMLInputElement).value.trim();
        const obraSocial = (document.getElementById('obraSocial') as HTMLSelectElement).value;
        const sillaRueda = (document.getElementById('sillaRueda') as HTMLInputElement).checked;
        const activo = (document.getElementById('activo') as HTMLInputElement).checked;
        
        if (!nombre || !apellido || !dni) {
          Swal.showValidationMessage('Nombre, apellido y DNI son obligatorios');
          return false;
        }

        // Validar formato de email si se proporciona
        if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          Swal.showValidationMessage('El formato del email no es válido');
          return false;
        }
        
        return { 
          nombre, 
          apellido, 
          dni, 
          telefono: telefono || undefined,
          email: email || undefined,
          direccion: direccion || undefined,
          ciudad: ciudad || undefined,
          idObraSocial: obraSocial ? parseInt(obraSocial) : null,
          sillaRueda,
          activo
        };
      }
    });

    if (formValues) {
      this.pacientesService.createPaciente(formValues).subscribe({
        next: (pacienteCreado) => {
          console.log('Paciente creado:', pacienteCreado); // Para debug
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
          Swal.fire({
            title: 'Error',
            text: 'No se pudo crear el paciente. ' + (err.error?.message || 'Intente nuevamente.'),
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
      });
    }
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
        next: (pacienteActualizado) => {
          console.log('Paciente actualizado:', pacienteActualizado); // Para debug
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
            text: `No se pudo ${accion} el paciente`,
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
      });
    }
  }

  getNombreObraSocial(idObraSocial: number | null): string {
    if (!idObraSocial) return '';
    const obraSocial = this.obrasSociales().find(os => os.id === idObraSocial);
    return obraSocial ? obraSocial.descripcion : 'Desconocida';
  }

  getEstadoBadgeClass(activo: boolean): string {
    return activo ? 'badge bg-success' : 'badge bg-secondary';
  }

  // Método para debugger el estado de los pacientes
  debugPacientes() {
    console.log('=== DEBUG PACIENTES ===');
    console.log('Total pacientes:', this.pacientes().length);
    console.log('Pacientes:', this.pacientes());
    console.log('Estadísticas:', this.estadisticas());
    console.log('=====================');
  }
}