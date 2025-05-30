// src/app/pages/admin/choferes/choferes.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChoferService } from '../../../services/chofer.service';
import { ChoferData, ChoferCreateDTO, EstadisticasChoferes, UsuarioDisponible } from '../../../interfaces/chofer.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-choferes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './choferes.component.html',
  styleUrls: ['./choferes.component.css']
})
export class ChoferesComponent implements OnInit {
  // Signals
  choferes = signal<ChoferData[]>([]);
  usuariosDisponibles = signal<UsuarioDisponible[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filtroActivo = signal('TODOS');

  // Computed
  choferesFiltrados = computed(() => {
    const filtro = this.filtroActivo();
    if (filtro === 'TODOS') {
      return this.choferes();
    }
    return this.choferes().filter(c => {
      if (filtro === 'ACTIVOS') return c.activo !== false;
      if (filtro === 'INACTIVOS') return c.activo === false;
      if (filtro === 'LICENCIA_VENCIDA') return this.isLicenciaVencida(c.fechaVencimientoLicencia);
      if (filtro === 'LICENCIA_POR_VENCER') return this.isLicenciaPorVencer(c.fechaVencimientoLicencia);
      return true;
    });
  });

  estadisticas = computed(() => {
    const total = this.choferes().length;
    const activos = this.choferes().filter(c => c.activo !== false).length;
    const inactivos = total - activos;
    const licenciasVencidas = this.choferes().filter(c => this.isLicenciaVencida(c.fechaVencimientoLicencia)).length;
    const licenciasPorVencer = this.choferes().filter(c => this.isLicenciaPorVencer(c.fechaVencimientoLicencia)).length;
    
    return { 
      totalChoferes: total, 
      choferesActivos: activos, 
      choferesInactivos: inactivos, 
      licenciasVencidas, 
      licenciasPorVencer 
    };
  });

  constructor(private choferService: ChoferService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);
    this.error.set(null);
    
    // Cargar choferes y usuarios disponibles en paralelo
    Promise.all([
      this.choferService.getAllChoferes().toPromise(),
      this.choferService.getUsuariosDisponibles().toPromise()
    ]).then(([choferes, usuarios]) => {
      this.choferes.set(choferes || []);
      this.usuariosDisponibles.set(usuarios || []);
      this.loading.set(false);
    }).catch(err => {
      this.error.set('Error al cargar los datos');
      this.loading.set(false);
      console.error('Error:', err);
    });
  }

  cambiarFiltro(filtro: string) {
    this.filtroActivo.set(filtro);
  }

  async crearChofer() {
    const usuarios = this.usuariosDisponibles();
    if (usuarios.length === 0) {
      Swal.fire({
        title: 'No hay usuarios disponibles',
        text: 'Todos los usuarios con rol CHOFER ya tienen un chofer asignado.',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    const usuariosOptions = usuarios.map(u => `<option value="${u.id}">${u.usuario}</option>`).join('');

    const { value: formValues } = await Swal.fire({
      title: 'Nuevo Chofer',
      html: `
        <div class="text-start mt-3">
          <div class="form-floating mb-3">
            <select class="form-select" id="usuario">
              <option value="">Seleccionar usuario...</option>
              ${usuariosOptions}
            </select>
            <label for="usuario"><i class="bi bi-person me-2"></i>Usuario</label>
          </div>
          
          <div class="row">
            <div class="col-6">
              <div class="form-floating mb-3">
                <input type="text" class="form-control" id="nombre" placeholder="Nombre">
                <label for="nombre"><i class="bi bi-person-badge me-2"></i>Nombre</label>
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
            <input type="text" class="form-control" id="direccion" placeholder="Dirección">
            <label for="direccion"><i class="bi bi-geo-alt me-2"></i>Dirección</label>
          </div>
          
          <div class="row">
            <div class="col-6">
              <div class="form-floating mb-3">
                <input type="date" class="form-control" id="licencia" placeholder="Venc. Licencia">
                <label for="licencia"><i class="bi bi-credit-card-2-front me-2"></i>Venc. Licencia</label>
              </div>
            </div>
            <div class="col-6">
              <div class="form-floating mb-3">
                <input type="date" class="form-control" id="contratacion" placeholder="F. Contratación">
                <label for="contratacion"><i class="bi bi-calendar me-2"></i>F. Contratación</label>
              </div>
            </div>
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
        const usuario = (document.getElementById('usuario') as HTMLSelectElement).value;
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value.trim();
        const apellido = (document.getElementById('apellido') as HTMLInputElement).value.trim();
        const dni = (document.getElementById('dni') as HTMLInputElement).value.trim();
        const telefono = (document.getElementById('telefono') as HTMLInputElement).value.trim();
        const direccion = (document.getElementById('direccion') as HTMLInputElement).value.trim();
        const licencia = (document.getElementById('licencia') as HTMLInputElement).value;
        const contratacion = (document.getElementById('contratacion') as HTMLInputElement).value;
        
        if (!usuario) {
          Swal.showValidationMessage('Debe seleccionar un usuario');
          return false;
        }
        if (!nombre || !apellido || !dni || !licencia) {
          Swal.showValidationMessage('Los campos marcados son obligatorios');
          return false;
        }
        
        return { 
          idUsuario: parseInt(usuario), 
          nombre, 
          apellido, 
          dni, 
          telefono: telefono || undefined,
          direccion: direccion || undefined,
          fechaVencimientoLicencia: licencia,
          fechaContratacion: contratacion || undefined
        };
      }
    });

    if (formValues) {
      this.choferService.createChofer(formValues).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Chofer Creado!',
            text: 'El chofer ha sido creado exitosamente',
            icon: 'success',
            confirmButtonColor: '#198754'
          });
          this.cargarDatos();
        },
        error: (err) => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo crear el chofer. ' + (err.error?.message || 'Intente nuevamente.'),
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
      });
    }
  }

  async toggleEstado(chofer: ChoferData) {
    const accion = chofer.activo !== false ? 'desactivar' : 'activar';
    const result = await Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} chofer?`,
      text: `¿Está seguro que desea ${accion} al chofer ${chofer.nombre} ${chofer.apellido}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: chofer.activo !== false ? '#dc3545' : '#198754'
    });

    if (result.isConfirmed) {
      this.choferService.toggleEstadoChofer(chofer.id).subscribe({
        next: () => {
          Swal.fire({
            title: `¡Chofer ${accion === 'activar' ? 'Activado' : 'Desactivado'}!`,
            text: `El chofer ha sido ${accion === 'activar' ? 'activado' : 'desactivado'} exitosamente`,
            icon: 'success',
            confirmButtonColor: '#198754'
          });
          this.cargarDatos();
        },
        error: (err) => {
          Swal.fire({
            title: 'Error',
            text: `No se pudo ${accion} el chofer`,
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
      });
    }
  }

  // Utilidades para fechas de licencia
  isLicenciaVencida(fecha: string): boolean {
    return new Date(fecha) < new Date();
  }

  isLicenciaPorVencer(fecha: string): boolean {
    const hoy = new Date();
    const vencimiento = new Date(fecha);
    const diasDiferencia = (vencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24);
    return diasDiferencia > 0 && diasDiferencia <= 30;
  }

  getEstadoBadgeClass(activo: boolean | undefined): string {
    return activo !== false ? 'badge bg-success' : 'badge bg-secondary';
  }

  getLicenciaBadgeClass(fecha: string): string {
    if (this.isLicenciaVencida(fecha)) return 'badge bg-danger';
    if (this.isLicenciaPorVencer(fecha)) return 'badge bg-warning';
    return 'badge bg-success';
  }

  getLicenciaTexto(fecha: string): string {
    if (this.isLicenciaVencida(fecha)) return 'Vencida';
    if (this.isLicenciaPorVencer(fecha)) return 'Por vencer';
    return 'Vigente';
  }
}