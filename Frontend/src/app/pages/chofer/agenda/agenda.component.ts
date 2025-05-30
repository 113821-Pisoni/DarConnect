import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrasladoService } from '../../../services/traslado.service';
import { ChoferService } from '../../../services/chofer.service';
import { AgendaSemanalResponse, TrasladoAgenda } from '../../../interfaces/agenda.interface';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})
export class AgendaComponent implements OnInit {
  
  agendaData = signal<AgendaSemanalResponse | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Propiedades para el modal
  trasladoSeleccionado = signal<any | null>(null);
  mostrarModal = signal<boolean>(false);

  // Días de la semana para el header
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  constructor(
    private trasladoService: TrasladoService,
    private choferService: ChoferService
  ) {}

  ngOnInit(): void {
    this.cargarAgenda();
  }

  private cargarAgenda(): void {
    this.loading.set(true);
    this.error.set(null);

    this.choferService.getCurrentChofer().subscribe({
      next: (chofer) => {
        this.trasladoService.getAgendaSemanal(chofer.id).subscribe({
          next: (agenda) => {
            this.agendaData.set(agenda);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Error al cargar la agenda');
            this.loading.set(false);
            console.error('Error cargando agenda:', err);
          }
        });
      },
      error: (err) => {
        this.error.set('Error al obtener datos del chofer');
        this.loading.set(false);
        console.error('Error obteniendo chofer:', err);
      }
    });
  }

  // Función para organizar traslados por día y hora
// Función para organizar traslados por día y hora
organizarTrasladosPorGrid() {
  const agenda = this.agendaData();
  if (!agenda) return new Map();

  // Debug: ver todos los campos disponibles en el primer traslado
  if (agenda.traslados.length > 0) {
    console.log('=== CAMPOS DISPONIBLES ===');
    console.log('Primer traslado completo:', agenda.traslados[0]);
    console.log('Claves disponibles:', Object.keys(agenda.traslados[0]));
  }

  const grid = new Map<string, any[]>();

  agenda.traslados.forEach(traslado => {
    const hora = this.formatearHora(traslado.horaProgramada);
    
    if (!grid.has(hora)) {
      grid.set(hora, new Array(7).fill(null));
    }

    const dias = traslado.diasSemana.split(',').map(d => parseInt(d.trim()));
    dias.forEach(dia => {
      const indice = dia - 1;
      grid.get(hora)![indice] = traslado;
    });
  });

  return grid;
}

  formatearHora(horaProgramada: any): string {
  if (!horaProgramada) {
    return '00:00';
  }
  
  if (typeof horaProgramada === 'string') {
    return horaProgramada;
  }
  
  // Si es un array [hour, minute]
  if (Array.isArray(horaProgramada) && horaProgramada.length >= 2) {
    const hour = horaProgramada[0].toString().padStart(2, '0');
    const minute = horaProgramada[1].toString().padStart(2, '0');
    return `${hour}:${minute}`;
  }
  
  // Si es un objeto con hour/minute
  if (horaProgramada.hour !== undefined && horaProgramada.minute !== undefined) {
    const hour = horaProgramada.hour.toString().padStart(2, '0');
    const minute = horaProgramada.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  }
  
  console.warn('Formato de hora desconocido:', horaProgramada);
  return '00:00';
}

  // Función para abrir el modal
  abrirDetalle(traslado: any): void {
    this.trasladoSeleccionado.set(traslado);
    this.mostrarModal.set(true);
  }

  // Función para cerrar el modal
  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.trasladoSeleccionado.set(null);
  }

  // Función para llamar por teléfono
  llamarPaciente(telefono: string): void {
    if (telefono) {
      window.open(`tel:${telefono}`, '_self');
    }
  }
  // Función helper para obtener traslados de un día específico (para mobile)
getTrasladosParaDia(diaIndex: number): any[] {
  const agenda = this.agendaData();
  if (!agenda) return [];

  const traslados: any[] = [];
  const grid = this.organizarTrasladosPorGrid();

  for (let [hora, diasArray] of grid.entries()) {
    if (diasArray[diaIndex]) {
      traslados.push({
        ...diasArray[diaIndex],
        horaFormateada: hora
      });
    }
  }

  return traslados.sort((a, b) => a.horaFormateada.localeCompare(b.horaFormateada));
}
}