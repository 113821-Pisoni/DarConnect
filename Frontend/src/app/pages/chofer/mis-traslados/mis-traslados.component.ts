// src/app/pages/chofer/mis-traslados/mis-traslados.component.ts
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrasladoService } from '../../../services/traslado.service';
import { TrasladoDelDia, EstadoTraslado } from '../../../interfaces/traslado.interface';

@Component({
  selector: 'app-mis-traslados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-traslados.component.html',
  styleUrl: './mis-traslados.component.css'
})
export class MisTrasladosComponent implements OnInit {
  private trasladoService = inject(TrasladoService);

  // Signals
  traslados = signal<TrasladoDelDia[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Computed signals para filtrar traslados
  trasladosActuales = computed(() => 
    this.traslados().filter(t => t.estadoActual === EstadoTraslado.INICIADO)
  );

  proximosTraslados = computed(() => 
    this.traslados().filter(t => t.estadoActual === EstadoTraslado.PENDIENTE)
  );

  ngOnInit() {
    this.cargarTraslados();
  }

  cargarTraslados() {
  this.isLoading.set(true);
  this.error.set(null);

  this.trasladoService.getTrasladosDelDia().subscribe({
    next: (traslados) => {
      console.log('=== DEBUG ESTADOS ===');
      traslados.forEach((t, i) => {
        console.log(`Traslado ${i}:`, {
          id: t.idTraslado,
          paciente: t.nombreCompletoPaciente,
          estadoActual: t.estadoActual,
          puedeIniciar: t.puedeIniciar,
          puedeFinalizar: t.puedeFinalizar
        });
      });
      
      console.log('PENDIENTES:', traslados.filter(t => t.estadoActual === EstadoTraslado.PENDIENTE).length);
      console.log('INICIADOS:', traslados.filter(t => t.estadoActual === EstadoTraslado.INICIADO).length);
      console.log('======================');
      
      this.traslados.set(traslados);
      this.isLoading.set(false);
    },
    error: (error) => {
      console.error('Error cargando traslados:', error);
      this.error.set('Error al cargar los traslados');
      this.isLoading.set(false);
    }
  });
}

  // Métodos para acciones
  iniciarTraslado(traslado: TrasladoDelDia) {
  console.log('🔥 INICIANDO TRASLADO - Función llamada');
  console.log('Traslado completo:', traslado);
  console.log('ID del traslado:', traslado?.idTraslado);
  console.log('Puede iniciar:', traslado?.puedeIniciar);
  console.log('Estado actual:', traslado?.estadoActual);
  
  if (!traslado) {
    console.error('❌ Traslado es null o undefined');
    return;
  }
  
  if (!traslado.idTraslado) {
    console.error('❌ ID del traslado es null o undefined');
    return;
  }
  
  console.log('✅ Llamando al servicio con ID:', traslado.idTraslado);
  
  this.trasladoService.iniciarTraslado(traslado.idTraslado).subscribe({
    next: () => {
      console.log('✅ Traslado iniciado correctamente');
      this.cargarTraslados();
    },
    error: (error) => {
      console.error('❌ Error iniciando traslado:', error);
      console.error('Detalles del error:', error.message, error.status);
    }
  });
}

  finalizarTraslado(traslado: TrasladoDelDia) {
    this.trasladoService.finalizarTraslado(traslado.idTraslado).subscribe({
      next: () => {
        console.log('Traslado finalizado correctamente');
        // Recargar traslados para ver el cambio de estado
        this.cargarTraslados();
      },
      error: (error) => {
        console.error('Error finalizando traslado:', error);
        // TODO: Mostrar mensaje de error al usuario
      }
    });
  }

  contactarPaciente(traslado: TrasladoDelDia) {
    if (traslado.telefonoPaciente) {
      window.open(`tel:${traslado.telefonoPaciente}`, '_self');
    }
  }

  abrirGoogleMaps(traslado: TrasladoDelDia) {
    const origen = encodeURIComponent(traslado.direccionOrigen);
    const destino = encodeURIComponent(traslado.direccionDestino);
    const url = `https://www.google.com/maps/dir/${origen}/${destino}`;
    window.open(url, '_blank');
  }

  // Métodos helper
  formatearHora(horaProgramada: any): string {
    try {
      console.log('Hora recibida:', horaProgramada);
      
      // Si es undefined o null
      if (!horaProgramada) {
        return '--:--';
      }
      
      // Si es un array [hour, minute]
      if (Array.isArray(horaProgramada) && horaProgramada.length >= 2) {
        const hour = horaProgramada[0].toString().padStart(2, '0');
        const minute = horaProgramada[1].toString().padStart(2, '0');
        return `${hour}:${minute}`;
      }
      
      // Si es un objeto con hour y minute
      if (typeof horaProgramada === 'object' && horaProgramada.hour !== undefined) {
        const hour = horaProgramada.hour.toString().padStart(2, '0');
        const minute = horaProgramada.minute.toString().padStart(2, '0');
        return `${hour}:${minute}`;
      }
      
      // Si es un string (formato HH:mm:ss)
      if (typeof horaProgramada === 'string') {
        const parts = horaProgramada.split(':');
        if (parts.length >= 2) {
          return `${parts[0]}:${parts[1]}`;
        }
        return horaProgramada;
      }
      
      // Si es un número (timestamp)
      if (typeof horaProgramada === 'number') {
        const date = new Date(horaProgramada);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      
      return 'N/A';
    } catch (error) {
      console.error('Error formateando hora:', error, horaProgramada);
      return 'Error';
    }
  }

  obtenerTiempoMockeado(): string {
    // Mock del tiempo estimado (15-30 min aleatorio)
    const tiempo = Math.floor(Math.random() * 16) + 15;
    return `${tiempo} min`;
  }
}