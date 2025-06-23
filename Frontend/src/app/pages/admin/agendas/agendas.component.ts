import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendaService } from '../../../services/agenda.service';
import { ChoferService } from '../../../services/chofer.service';
import { Agenda, AgendaCreateDTO } from '../../../interfaces/agenda.interface';
import { ChoferData } from '../../../interfaces/chofer.interface';
import { AgendasModalComponent } from './agenda-modal/agenda-modal.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agendas',
  standalone: true,
  imports: [CommonModule, AgendasModalComponent],
  templateUrl: './agendas.component.html',
  styleUrls: ['./agendas.component.css']
})
export class AgendasComponent implements OnInit {
  
  @ViewChild(AgendasModalComponent) modal!: AgendasModalComponent;

  // Signals
  agendas = signal<Agenda[]>([]);
  choferes = signal<ChoferData[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filtroActivo = signal('TODAS');
  
  // Modal signals
  modalOpen = signal(false);

  // Computed
  agendasFiltradas = computed(() => {
    const filtro = this.filtroActivo();
    if (filtro === 'TODAS') {
      return this.agendas();
    }
    return this.agendas().filter(agenda => {
      if (filtro === 'ACTIVAS') return agenda.activo;
      if (filtro === 'INACTIVAS') return !agenda.activo;
      return true;
    });
  });

  estadisticas = computed(() => {
    const total = this.agendas().length;
    const activas = this.agendas().filter(a => a.activo).length;
    const inactivas = total - activas;
    
    return { 
      totalAgendas: total, 
      agendasActivas: activas, 
      agendasInactivas: inactivas
    };
  });

  // Computed para choferes disponibles (sin agenda activa)
  choferesDisponibles = computed(() => {
    const agendasActivas = this.agendas().filter(a => a.activo);
    const choferesConAgenda = agendasActivas.map(a => a.idChofer);
    
    return this.choferes().filter(chofer => 
      (chofer.activo !== false) && !choferesConAgenda.includes(chofer.id)
    );
  });

  constructor(
    private agendaService: AgendaService,
    private choferService: ChoferService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);
    this.error.set(null);
    
    Promise.all([
      this.cargarAgendas(),
      this.cargarChoferes()
    ]).finally(() => {
      this.loading.set(false);
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
          console.error('Error al cargar agendas:', err);
          this.error.set('Error al cargar las agendas');
          reject(err);
        }
      });
    });
  }

  private cargarChoferes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.choferService.getAllChoferes().subscribe({
        next: (choferes) => {
          this.choferes.set(choferes);
          resolve();
        },
        error: (err) => {
          console.warn('Error al cargar choferes:', err);
          resolve(); // No bloqueamos la carga si fallan los choferes
        }
      });
    });
  }

  cambiarFiltro(filtro: string) {
    this.filtroActivo.set(filtro);
  }

  // Modal methods
  abrirModalCrear() {
    const choferesDisponibles = this.choferesDisponibles();
    
    if (choferesDisponibles.length === 0) {
      Swal.fire({
        title: 'Sin choferes disponibles',
        text: 'No hay choferes disponibles para crear una nueva agenda. Todos los choferes activos ya tienen agenda asignada.',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    this.modalOpen.set(true);
  }

  cerrarModal() {
    this.modalOpen.set(false);
  }

  onSaveAgenda(data: AgendaCreateDTO) {
    this.crearAgenda(data);
  }

  private crearAgenda(agendaData: AgendaCreateDTO) {
    this.agendaService.createAgenda(agendaData).subscribe({
      next: (agendaCreada) => {
        this.modal.finishLoading();
        this.cerrarModal();
        
        Swal.fire({
          title: '¡Agenda Creada!',
          text: `La agenda para ${agendaCreada.nombreChofer} ${agendaCreada.apellidoChofer} ha sido creada exitosamente`,
          icon: 'success',
          confirmButtonColor: '#198754'
        });
        
        this.cargarAgendas();
      },
      error: (err) => {
        console.error('Error al crear agenda:', err);
        this.modal.finishLoading();
        
        let mensaje = 'No se pudo crear la agenda. Intente nuevamente.';
        if (err.status === 400 && err.error?.message?.includes('chofer')) {
          mensaje = 'El chofer seleccionado no está disponible o ya tiene una agenda activa.';
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

  async desactivarAgenda(agenda: Agenda) {
    const result = await Swal.fire({
      title: '¿Desactivar agenda?',
      text: `¿Está seguro que desea desactivar la agenda de ${agenda.nombreChofer} ${agenda.apellidoChofer}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    });

    if (result.isConfirmed) {
      this.agendaService.deleteAgenda(agenda.id).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Agenda Desactivada!',
            text: 'La agenda ha sido desactivada exitosamente',
            icon: 'success',
            confirmButtonColor: '#198754'
          });
          this.cargarAgendas();
        },
        error: (err) => {
          console.error('Error al desactivar agenda:', err);
          let mensaje = 'No se pudo desactivar la agenda';
          
          if (err.status === 400 && err.error?.message?.includes('traslados')) {
            mensaje = 'No se puede desactivar la agenda porque tiene traslados pendientes.';
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

  getNombreCompleto(agenda: Agenda): string {
    return `${agenda.nombreChofer} ${agenda.apellidoChofer}`;
  }

  debugAgendas() {
    console.log('=== DEBUG AGENDAS ===');
    console.log('Total agendas:', this.agendas().length);
    console.log('Agendas:', this.agendas());
    console.log('Choferes disponibles:', this.choferesDisponibles());
    console.log('Estadísticas:', this.estadisticas());
    console.log('====================');
  }
}