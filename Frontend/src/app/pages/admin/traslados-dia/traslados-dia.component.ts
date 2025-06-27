// src/app/pages/admin/traslados-dia/traslados-dia.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrasladoService } from '../../../services/traslado.service';
import { TrasladoDelDia, EstadoTraslado, ESTADOS_TRASLADO } from '../../../interfaces/traslado.interface';
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
        switch (estado) {
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
    
    const fechaHoy = new Date().toLocaleDateString('sv-SE');
    
    this.trasladoService.getTrasladosDelDiaAdmin(fechaHoy).subscribe({
      next: (traslados) => {
        this.traslados.set(traslados);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar traslados:', err);
        this.error.set('Error al cargar los traslados del día. Verifique la conexión con el servidor.');
        this.loading.set(false);
      }
    });
  }

  cambiarFiltro(filtro: string) {
    this.filtroActivo.set(filtro);
  }

  contactarPaciente(telefono: string) {
    if (telefono) {
      window.open(`tel:${telefono}`);
    } else {
      Swal.fire({
        title: 'Sin teléfono',
        text: 'No hay número de teléfono registrado para este paciente',
        icon: 'warning',
        confirmButtonColor: '#6c757d'
      });
    }
  }

  contactarChofer(idTraslado: number) {
    const traslado = this.traslados().find(t => t.idTraslado === idTraslado);
    
    if (traslado) {
      if (traslado.telefonoChofer) {
        window.open(`tel:${traslado.telefonoChofer}`);
        return;
      }
      
      const trasladoAny = traslado as any;
      if (trasladoAny.telefono_chofer) {
        window.open(`tel:${trasladoAny.telefono_chofer}`);
        return;
      }
      
      if (trasladoAny.choferTelefono) {
        window.open(`tel:${trasladoAny.choferTelefono}`);
        return;
      }
      
      if (traslado.nombreCompletoChofer) {
        Swal.fire({
          title: 'Información del Chofer',
          html: `
            <div class="text-start">
              <p><strong>Chofer:</strong> ${traslado.nombreCompletoChofer}</p>
              <p><strong>Estado del traslado:</strong> 
                <span class="badge bg-${ESTADOS_TRASLADO[traslado.estadoActual].color}">
                  ${this.getEstadoLabel(traslado.estadoActual)}
                </span>
              </p>
              <p class="text-muted small">No hay teléfono de contacto registrado</p>
            </div>
          `,
          icon: 'info',
          confirmButtonColor: '#6c757d',
          confirmButtonText: 'Entendido'
        });
        return;
      }
    }
    
    Swal.fire({
      title: 'Sin información',
      text: 'No hay información de contacto disponible para este chofer',
      icon: 'warning',
      confirmButtonColor: '#6c757d'
    });
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
        Swal.fire({
          title: 'Cancelando...',
          text: 'Por favor espere',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.trasladoService.cancelarTraslado(idTraslado, result.value.trim()).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Traslado Cancelado!',
              text: 'El traslado ha sido cancelado exitosamente',
              icon: 'success',
              confirmButtonColor: '#198754'
            });
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
      return horaProgramada.substring(0, 5);
    }
    
    if (Array.isArray(horaProgramada) && horaProgramada.length >= 2) {
      const hora = horaProgramada[0].toString().padStart(2, '0');
      const minuto = horaProgramada[1].toString().padStart(2, '0');
      return `${hora}:${minuto}`;
    }
    
    if (horaProgramada.hour !== undefined && horaProgramada.minute !== undefined) {
      const hora = horaProgramada.hour.toString().padStart(2, '0');
      const minuto = horaProgramada.minute.toString().padStart(2, '0');
      return `${hora}:${minuto}`;
    }
    
    return '--:--';
  }

  getBadgeClass(estado: EstadoTraslado): string {
    const estadoInfo = ESTADOS_TRASLADO[estado];
    return estadoInfo ? `badge bg-${estadoInfo.color}` : 'badge bg-secondary';
  }

  getEstadoLabel(estado: EstadoTraslado): string {
    const estadoInfo = ESTADOS_TRASLADO[estado];
    return estadoInfo ? estadoInfo.label : estado;
  }

  getEstadoIcon(estado: EstadoTraslado): string {
    const estadoInfo = ESTADOS_TRASLADO[estado];
    return estadoInfo ? estadoInfo.icon : 'question-circle';
  }

  fechaHoy(): string {
    return new Date().toLocaleDateString('es-AR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  refrescarDatos() {
    this.cargarTraslados();
  }

  cargarTrasladosPorEstado(estado?: EstadoTraslado) {
    this.loading.set(true);
    this.error.set(null);
    
    const fechaHoy = new Date().toISOString().split('T')[0];
    
    this.trasladoService.getTrasladosDelDiaAdmin(fechaHoy, estado).subscribe({
      next: (traslados) => {
        this.traslados.set(traslados);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar traslados filtrados:', err);
        this.error.set('Error al cargar los traslados filtrados');
        this.loading.set(false);
      }
    });
  }

  trackByTrasladoId(index: number, traslado: TrasladoDelDia): number {
    return traslado.idTraslado;
  }
}