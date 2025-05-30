// src/app/pages/admin/traslados-dia/traslados-dia.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrasladoService } from '../../../services/traslado.service';
import { TrasladoDelDia,EstadoTraslado } from '../../../interfaces/traslado.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-traslados-dia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './traslados-dia.component.html',
  styleUrls: ['./traslados-dia.component.css']
})
export class TrasladosDiaComponent implements OnInit {
  // Signals
  traslados = signal<TrasladoDelDia[]>([]);
  loading = signal(true);
  filtroActivo = signal('TODOS');
  error = signal<string | null>(null);

  // Computed
  estadisticas = computed(() => {
    const stats = this.traslados().reduce(
      (acc, traslado) => {
        const estado = traslado.estadoActual;
        switch(estado) {
          case EstadoTraslado.PENDIENTE:
            acc.pendientes++;
            break;
          case EstadoTraslado.INICIADO:
            acc.iniciados++;
            break;
          case EstadoTraslado.FINALIZADO:
            acc.finalizados++;
            break;
          case EstadoTraslado.CANCELADO:
            acc.cancelados++;
            break;
        }
        return acc;
      },
      { pendientes: 0, iniciados: 0, finalizados: 0, cancelados: 0 }
    );
    console.log('Estadísticas calculadas:', stats); // DEBUG
    return stats;
  });

  trasladosFiltrados = computed(() => {
    const filtro = this.filtroActivo();
    if (filtro === 'TODOS') {
      return this.traslados();
    }
    return this.traslados().filter(t => t.estadoActual === filtro);
  });

  constructor(private trasladoService: TrasladoService) {}

  ngOnInit() {
    this.cargarTraslados();
  }

  cargarTraslados() {
    this.loading.set(true);
    this.error.set(null);
    
    // Usar el endpoint que existía antes - necesitas crear TrasladosAdminService o usar endpoint directo
    console.warn('Método getTrasladosDelDiaAdmin() removido - usar TrasladosAdminService original');
    this.loading.set(false);
    this.error.set('Servicio de traslados del día temporalmente deshabilitado');
  }

  cambiarFiltro(filtro: string) {
    this.filtroActivo.set(filtro);
  }

  contactarPaciente(telefono: string) {
    if (telefono) {
      window.open(`tel:${telefono}`);
    }
  }

  contactarChofer(idTraslado: number) {
    // Por implementar - obtener teléfono del chofer
    console.log('Contactar chofer del traslado:', idTraslado);
  }

  cancelarTraslado(idTraslado: number) {
    Swal.fire({
      title: 'Cancelar Traslado',
      text: '¿Cuál es el motivo de la cancelación?',
      input: 'textarea',
      inputPlaceholder: 'Escribe el motivo aquí...',
      showCancelButton: true,
      confirmButtonText: 'Cancelar Traslado',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Debe ingresar un motivo para la cancelación';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        // Mostrar loading
        Swal.fire({
          title: 'Cancelando...',
          text: 'Por favor espere',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Llamar a la API usando el servicio unificado
        this.trasladoService.cancelarTraslado(idTraslado, result.value.trim()).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Traslado Cancelado!',
              text: 'El traslado ha sido cancelado exitosamente',
              icon: 'success',
              confirmButtonColor: '#198754'
            });
            // Recargar datos
            this.cargarTraslados();
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo cancelar el traslado. Intente nuevamente.',
              icon: 'error',
              confirmButtonColor: '#dc3545'
            });
            console.error('Error:', err);
          }
        });
      }
    });
  }

  formatearHora(horaProgramada: any): string {
    if (!horaProgramada) {
      return '--:--';
    }
    
    if (typeof horaProgramada === 'string') {
      return horaProgramada.substring(0, 5); // "HH:mm:ss" -> "HH:mm"
    }
    
    // Si viene como array [hora, minuto]
    if (Array.isArray(horaProgramada) && horaProgramada.length >= 2) {
      const hora = horaProgramada[0].toString().padStart(2, '0');
      const minuto = horaProgramada[1].toString().padStart(2, '0');
      return `${hora}:${minuto}`;
    }
    
    // Si viene como objeto {hour, minute, second, nano}
    if (horaProgramada.hour !== undefined && horaProgramada.minute !== undefined) {
      const hora = horaProgramada.hour.toString().padStart(2, '0');
      const minuto = horaProgramada.minute.toString().padStart(2, '0');
      return `${hora}:${minuto}`;
    }
    
    return '--:--';
  }

  getBadgeClass(estado: EstadoTraslado): string {
    const classes = {
      [EstadoTraslado.PENDIENTE]: 'badge bg-warning',
      [EstadoTraslado.INICIADO]: 'badge bg-success',
      [EstadoTraslado.FINALIZADO]: 'badge bg-primary',
      [EstadoTraslado.CANCELADO]: 'badge bg-danger'
    };
    return classes[estado] || 'badge bg-secondary';
  }

  getEstadoLabel(estado: EstadoTraslado): string {
    const labels = {
      [EstadoTraslado.PENDIENTE]: 'Pendiente',
      [EstadoTraslado.INICIADO]: 'En Curso',
      [EstadoTraslado.FINALIZADO]: 'Finalizado',
      [EstadoTraslado.CANCELADO]: 'Cancelado'
    };
    return labels[estado] || estado;
  }

  fechaHoy(): string {
    return new Date().toLocaleDateString('es-AR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}