import { Component, OnInit, signal, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class AgendaComponent implements OnInit, OnChanges {
 
 @Input() choferId?: number;
 
 agendaData = signal<AgendaSemanalResponse | null>(null);
 loading = signal<boolean>(true);
 error = signal<string | null>(null);

 trasladoSeleccionado = signal<any | null>(null);
 mostrarModal = signal<boolean>(false);

 diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

 constructor(
   private trasladoService: TrasladoService,
   private choferService: ChoferService
 ) {}

 ngOnInit(): void {
   if (!this.choferId) {
     this.cargarAgenda();
   }
 }

 ngOnChanges(changes: SimpleChanges): void {
   if (changes['choferId'] && this.choferId) {
     this.cargarAgendaDirecta(this.choferId);
   }
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
         }
       });
     },
     error: (err) => {
       this.error.set('Error al obtener datos del chofer');
       this.loading.set(false);
     }
   });
 }

 private cargarAgendaDirecta(choferId: number): void {
   this.loading.set(true);
   this.error.set(null);

   this.trasladoService.getAgendaSemanal(choferId).subscribe({
     next: (agenda) => {
       this.agendaData.set(agenda);
       this.loading.set(false);
     },
     error: (err) => {
       this.error.set('Error al cargar la agenda del chofer');
       this.loading.set(false);
     }
   });
 }

 organizarTrasladosPorGrid() {
   const agenda = this.agendaData();
   if (!agenda) return new Map();

   const grid = new Map<string, any[]>();

   agenda.traslados.forEach(traslado => {
     const hora = this.formatearHora(traslado.horaProgramada);
     
     if (!grid.has(hora)) {
       grid.set(hora, new Array(7).fill(null));
     }

     const dias = traslado.diasSemana.split(',').map(d => parseInt(d.trim()));
     dias.forEach(dia => {
       const indice = dia - 1;
       if (indice >= 0 && indice < 7) {
         grid.get(hora)![indice] = traslado;
       }
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
   
   if (Array.isArray(horaProgramada) && horaProgramada.length >= 2) {
     const hour = horaProgramada[0].toString().padStart(2, '0');
     const minute = horaProgramada[1].toString().padStart(2, '0');
     return `${hour}:${minute}`;
   }
   
   if (horaProgramada.hour !== undefined && horaProgramada.minute !== undefined) {
     const hour = horaProgramada.hour.toString().padStart(2, '0');
     const minute = horaProgramada.minute.toString().padStart(2, '0');
     return `${hour}:${minute}`;
   }
   
   return '00:00';
 }

 abrirDetalle(traslado: any): void {
   this.trasladoSeleccionado.set(traslado);
   this.mostrarModal.set(true);
   document.body.style.overflow = 'hidden';
 }

 cerrarModal(): void {
   this.mostrarModal.set(false);
   this.trasladoSeleccionado.set(null);
   document.body.style.overflow = 'auto';
 }

 llamarPaciente(telefono: string): void {
   if (telefono) {
     window.open(`tel:${telefono}`, '_self');
   }
 }

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

 testModal(): void {
   const testTraslado = {
     nombreCompletoPaciente: 'Test Patient',
     telefonoPaciente: '123456789',
     horaProgramada: '10:00',
     sillaRueda: false,
     direccionOrigen: 'Test Origin',
     direccionDestino: 'Test Destination',
     observaciones: 'Test observations'
   };
   this.abrirDetalle(testTraslado);
 }
}