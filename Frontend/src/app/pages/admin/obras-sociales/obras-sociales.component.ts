// src/app/pages/admin/obras-sociales/obras-sociales.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObrasSocialesService } from '../../../services/obras-sociales.service';
import { ObraSocial, ObraSocialCreateDTO, EstadisticasObrasSociales } from '../../../interfaces/obraSocial.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-obras-sociales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './obras-sociales.component.html',
  styleUrls: ['./obras-sociales.component.css']
})
export class ObrasSocialesComponent implements OnInit {
  
  // Signals
  obrasSociales = signal<ObraSocial[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filtroActivo = signal('TODOS');

  // Computed
  obrasSocialesFiltradas = computed(() => {
    const filtro = this.filtroActivo();
    if (filtro === 'TODOS') {
      return this.obrasSociales();
    }
    return this.obrasSociales().filter(os => {
      if (filtro === 'ACTIVAS') return os.activo;
      if (filtro === 'INACTIVAS') return !os.activo;
      return true;
    });
  });

  estadisticas = computed(() => {
    const total = this.obrasSociales().length;
    const activas = this.obrasSociales().filter(os => os.activo).length;
    const inactivas = total - activas;
    
    return { 
      totalObrasSociales: total, 
      obrasSocialesActivas: activas, 
      obrasSocialesInactivas: inactivas
    };
  });

  constructor(private obrasSocialesService: ObrasSocialesService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);
    this.error.set(null);
    
    this.cargarObrasSociales().finally(() => {
      this.loading.set(false);
    });
  }

  private cargarObrasSociales(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.obrasSocialesService.getObrasSociales().subscribe({
        next: (obrasSociales) => {
          console.log('Obras sociales recibidas:', obrasSociales); // Para debug
          this.obrasSociales.set(obrasSociales);
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar obras sociales:', err);
          this.error.set('Error al cargar las obras sociales');
          reject(err);
        }
      });
    });
  }

  cambiarFiltro(filtro: string) {
    this.filtroActivo.set(filtro);
  }

  async crearObraSocial() {
    const { value: formValues } = await Swal.fire({
      title: 'Nueva Obra Social',
      html: `
        <div class="text-start mt-3">
          <div class="form-floating mb-3">
            <input type="text" class="form-control" id="descripcion" placeholder="Descripción">
            <label for="descripcion"><i class="bi bi-heart-pulse me-2"></i>Descripción</label>
          </div>
          
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="activo" checked>
            <label class="form-check-label" for="activo">
              <i class="bi bi-check-circle me-2"></i>Obra social activa
            </label>
          </div>
        </div>
      `,
      width: '500px',
      showCancelButton: true,
      confirmButtonText: '<i class="bi bi-check me-1"></i>Crear',
      cancelButtonText: '<i class="bi bi-x me-1"></i>Cancelar',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value.trim();
        const activo = (document.getElementById('activo') as HTMLInputElement).checked;
        
        if (!descripcion) {
          Swal.showValidationMessage('La descripción es obligatoria');
          return false;
        }

        if (descripcion.length < 3) {
          Swal.showValidationMessage('La descripción debe tener al menos 3 caracteres');
          return false;
        }

        // Validar si ya existe una obra social con la misma descripción
        const existe = this.obrasSociales().some(os => 
          os.descripcion.toLowerCase() === descripcion.toLowerCase()
        );
        
        if (existe) {
          Swal.showValidationMessage('Ya existe una obra social con esa descripción');
          return false;
        }
        
        return { descripcion, activo };
      }
    });

    if (formValues) {
      this.obrasSocialesService.createObraSocial(formValues).subscribe({
        next: (obraSocialCreada) => {
          console.log('Obra social creada:', obraSocialCreada); // Para debug
          Swal.fire({
            title: '¡Obra Social Creada!',
            text: 'La obra social ha sido creada exitosamente',
            icon: 'success',
            confirmButtonColor: '#198754'
          });
          this.cargarObrasSociales();
        },
        error: (err) => {
          console.error('Error al crear obra social:', err);
          let mensaje = 'No se pudo crear la obra social. Intente nuevamente.';
          
          // Manejar error de descripción duplicada del backend
          if (err.status === 400 && err.error?.message?.includes('descripción')) {
            mensaje = 'Ya existe una obra social con esa descripción.';
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

  async editarObraSocial(obraSocial: ObraSocial) {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Obra Social',
      html: `
        <div class="text-start mt-3">
          <div class="form-floating mb-3">
            <input type="text" class="form-control" id="descripcion" placeholder="Descripción" value="${obraSocial.descripcion}">
            <label for="descripcion"><i class="bi bi-heart-pulse me-2"></i>Descripción</label>
          </div>
          
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="activo" ${obraSocial.activo ? 'checked' : ''}>
            <label class="form-check-label" for="activo">
              <i class="bi bi-check-circle me-2"></i>Obra social activa
            </label>
          </div>
        </div>
      `,
      width: '500px',
      showCancelButton: true,
      confirmButtonText: '<i class="bi bi-check me-1"></i>Actualizar',
      cancelButtonText: '<i class="bi bi-x me-1"></i>Cancelar',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value.trim();
        const activo = (document.getElementById('activo') as HTMLInputElement).checked;
        
        if (!descripcion) {
          Swal.showValidationMessage('La descripción es obligatoria');
          return false;
        }

        if (descripcion.length < 3) {
          Swal.showValidationMessage('La descripción debe tener al menos 3 caracteres');
          return false;
        }

        // Validar si ya existe otra obra social con la misma descripción
        const existe = this.obrasSociales().some(os => 
          os.id !== obraSocial.id && os.descripcion.toLowerCase() === descripcion.toLowerCase()
        );
        
        if (existe) {
          Swal.showValidationMessage('Ya existe otra obra social con esa descripción');
          return false;
        }
        
        return { descripcion, activo };
      }
    });

    if (formValues) {
      this.obrasSocialesService.updateObraSocial(obraSocial.id, formValues).subscribe({
        next: (obraSocialActualizada) => {
          console.log('Obra social actualizada:', obraSocialActualizada); // Para debug
          Swal.fire({
            title: '¡Obra Social Actualizada!',
            text: 'La obra social ha sido actualizada exitosamente',
            icon: 'success',
            confirmButtonColor: '#198754'
          });
          this.cargarObrasSociales();
        },
        error: (err) => {
          console.error('Error al actualizar obra social:', err);
          let mensaje = 'No se pudo actualizar la obra social. Intente nuevamente.';
          
          if (err.status === 400 && err.error?.message?.includes('descripción')) {
            mensaje = 'Ya existe una obra social con esa descripción.';
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

  async toggleEstado(obraSocial: ObraSocial) {
    const accion = obraSocial.activo ? 'desactivar' : 'activar';
    const result = await Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} obra social?`,
      text: `¿Está seguro que desea ${accion} la obra social "${obraSocial.descripcion}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: obraSocial.activo ? '#dc3545' : '#198754'
    });

    if (result.isConfirmed) {
      this.obrasSocialesService.toggleEstadoObraSocial(obraSocial.id).subscribe({
        next: () => {
          Swal.fire({
            title: `¡Obra Social ${accion === 'activar' ? 'Activada' : 'Desactivada'}!`,
            text: `La obra social ha sido ${accion === 'activar' ? 'activada' : 'desactivada'} exitosamente`,
            icon: 'success',
            confirmButtonColor: '#198754'
          });
          this.cargarObrasSociales();
        },
        error: (err) => {
          console.error('Error al cambiar estado:', err);
          Swal.fire({
            title: 'Error',
            text: `No se pudo ${accion} la obra social`,
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
      });
    }
  }

  async eliminarObraSocial(obraSocial: ObraSocial) {
    const result = await Swal.fire({
      title: '¿Eliminar obra social?',
      text: `¿Está seguro que desea eliminar la obra social "${obraSocial.descripcion}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
      this.obrasSocialesService.deleteObraSocial(obraSocial.id).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Obra Social Eliminada!',
            text: 'La obra social ha sido eliminada exitosamente',
            icon: 'success',
            confirmButtonColor: '#198754'
          });
          this.cargarObrasSociales();
        },
        error: (err) => {
          console.error('Error al eliminar obra social:', err);
          let mensaje = 'No se pudo eliminar la obra social';
          
          // Manejar error si tiene pacientes asociados
          if (err.status === 400 && err.error?.message?.includes('pacientes')) {
            mensaje = 'No se puede eliminar la obra social porque tiene pacientes asociados.';
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

  getEstadoBadgeClass(activo: boolean): string {
    return activo ? 'badge bg-success' : 'badge bg-secondary';
  }

  // Método para debugger el estado de las obras sociales
  debugObrasSociales() {
    console.log('=== DEBUG OBRAS SOCIALES ===');
    console.log('Total obras sociales:', this.obrasSociales().length);
    console.log('Obras sociales:', this.obrasSociales());
    console.log('Estadísticas:', this.estadisticas());
    console.log('============================');
  }
}