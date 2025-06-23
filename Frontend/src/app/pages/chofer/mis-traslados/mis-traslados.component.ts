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

 traslados = signal<TrasladoDelDia[]>([]);
 isLoading = signal(true);
 error = signal<string | null>(null);

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
       this.traslados.set(traslados);
       this.isLoading.set(false);
     },
     error: (error) => {
       this.error.set('Error al cargar los traslados');
       this.isLoading.set(false);
     }
   });
 }

 iniciarTraslado(traslado: TrasladoDelDia) {
   if (!traslado || !traslado.idTraslado) {
     return;
   }
   
   this.trasladoService.iniciarTraslado(traslado.idTraslado).subscribe({
     next: () => {
       this.cargarTraslados();
     },
     error: (error) => {
       // TODO: Mostrar mensaje de error al usuario
     }
   });
 }

 finalizarTraslado(traslado: TrasladoDelDia) {
   this.trasladoService.finalizarTraslado(traslado.idTraslado).subscribe({
     next: () => {
       this.cargarTraslados();
     },
     error: (error) => {
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

 formatearHora(horaProgramada: any): string {
   try {
     if (!horaProgramada) {
       return '--:--';
     }
     
     if (Array.isArray(horaProgramada) && horaProgramada.length >= 2) {
       const hour = horaProgramada[0].toString().padStart(2, '0');
       const minute = horaProgramada[1].toString().padStart(2, '0');
       return `${hour}:${minute}`;
     }
     
     if (typeof horaProgramada === 'object' && horaProgramada.hour !== undefined) {
       const hour = horaProgramada.hour.toString().padStart(2, '0');
       const minute = horaProgramada.minute.toString().padStart(2, '0');
       return `${hour}:${minute}`;
     }
     
     if (typeof horaProgramada === 'string') {
       const parts = horaProgramada.split(':');
       if (parts.length >= 2) {
         return `${parts[0]}:${parts[1]}`;
       }
       return horaProgramada;
     }
     
     if (typeof horaProgramada === 'number') {
       const date = new Date(horaProgramada);
       return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
     }
     
     return 'N/A';
   } catch (error) {
     return 'Error';
   }
 }

 calcularTiempoReal(traslado: TrasladoDelDia) {
   traslado.calculando = true;
   traslado.tiempoActual = traslado.tiempoActual || 'Calcular tiempo';
   
   this.trasladoService.calcularTiempoReal(traslado.idTraslado).subscribe({
     next: (response) => {
       if (response.success) {
         traslado.tiempoActual = response.trafico;
         const ahora = new Date();
         traslado.ultimaActualizacion = 
         `Actualizado a las ${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
       } else {
         traslado.tiempoActual = 'Error al calcular';
       }
       traslado.calculando = false;
     },
     error: (error) => {
       traslado.tiempoActual = 'Error de conexión';
       traslado.calculando = false;
     }
   });
 }
}