// src/app/pages/admin/choferes/choferes.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChoferService } from '../../../services/chofer.service';
import { ChoferData, ChoferCreateDTO, EstadisticasChoferes, UsuarioDisponible } from '../../../interfaces/chofer.interface';
import { ChoferModalComponent, ModalMode } from './chofer-modal/chofer-modal.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-choferes',
  standalone: true,
  imports: [CommonModule, ChoferModalComponent],
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

  // Modal signals
  modalOpen = signal(false);
  modalMode = signal<ModalMode>('create');
  selectedChofer = signal<ChoferData | null>(null);

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

  // ====== MODAL METHODS ======

  crearChofer() {
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

    this.modalMode.set('create');
    this.selectedChofer.set(null);
    this.modalOpen.set(true);
  }

  editarChofer(chofer: ChoferData) {
    this.modalMode.set('edit');
    this.selectedChofer.set(chofer);
    this.modalOpen.set(true);
  }

  onModalClose() {
    this.modalOpen.set(false);
    this.selectedChofer.set(null);
  }

  onModalSave() {
    this.modalOpen.set(false);
    this.selectedChofer.set(null);
    
    // Mostrar mensaje de éxito
    const mensaje = this.modalMode() === 'create' ? 'creado' : 'actualizado';
    Swal.fire({
      title: `¡Chofer ${mensaje.charAt(0).toUpperCase() + mensaje.slice(1)}!`,
      text: `El chofer ha sido ${mensaje} exitosamente`,
      icon: 'success',
      confirmButtonColor: '#198754'
    });
    
    // Recargar datos
    this.cargarDatos();
  }

  // ====== OTROS MÉTODOS (SIN CAMBIOS) ======

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