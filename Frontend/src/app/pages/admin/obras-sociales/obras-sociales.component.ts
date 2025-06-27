import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObrasSocialesService } from '../../../services/obras-sociales.service';
import { ObraSocial, ObraSocialCreateDTO, ObraSocialUpdateDTO } from '../../../interfaces/obraSocial.interface';
import { ObrasSocialesModalComponent, ModalMode } from './obra-social-modal/obra-social-modal.component';
import Swal from 'sweetalert2';

@Component({
 selector: 'app-obras-sociales',
 standalone: true,
 imports: [CommonModule, ObrasSocialesModalComponent],
 templateUrl: './obras-sociales.component.html',
 styleUrls: ['./obras-sociales.component.css']
})
export class ObrasSocialesComponent implements OnInit {
 
 @ViewChild(ObrasSocialesModalComponent) modal!: ObrasSocialesModalComponent;

 obrasSociales = signal<ObraSocial[]>([]);
 loading = signal(true);
 error = signal<string | null>(null);
 filtroActivo = signal('TODOS');
 
 modalOpen = signal(false);
 modalMode = signal<ModalMode>('create');
 selectedObraSocial = signal<ObraSocial | null>(null);

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

 existingDescriptions = computed(() => {
   return this.obrasSociales().map(os => os.descripcion);
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
         this.obrasSociales.set(obrasSociales);
         resolve();
       },
       error: (err) => {
         this.error.set('Error al cargar las obras sociales');
         reject(err);
       }
     });
   });
 }

 cambiarFiltro(filtro: string) {
   this.filtroActivo.set(filtro);
 }

 abrirModalCrear() {
   this.modalMode.set('create');
   this.selectedObraSocial.set(null);
   this.modalOpen.set(true);
 }

 abrirModalEditar(obraSocial: ObraSocial) {
   this.modalMode.set('edit');
   this.selectedObraSocial.set(obraSocial);
   this.modalOpen.set(true);
 }

 cerrarModal() {
   this.modalOpen.set(false);
 }

 onSaveObraSocial(data: ObraSocialCreateDTO | ObraSocialUpdateDTO) {
   if (this.modalMode() === 'create') {
     this.crearObraSocial(data as ObraSocialCreateDTO);
   } else {
     this.actualizarObraSocial(data as ObraSocialUpdateDTO);
   }
 }

 private crearObraSocial(obraSocialData: ObraSocialCreateDTO) {
   this.obrasSocialesService.createObraSocial(obraSocialData).subscribe({
     next: (obraSocialCreada) => {
       this.modal.finishLoading();
       this.cerrarModal();
       
       Swal.fire({
         title: '¡Obra Social Creada!',
         text: 'La obra social ha sido creada exitosamente',
         icon: 'success',
         confirmButtonColor: '#198754'
       });
       
       this.cargarObrasSociales();
     },
     error: (err) => {
       this.modal.finishLoading();
       
       let mensaje = 'No se pudo crear la obra social. Intente nuevamente.';
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

 private actualizarObraSocial(obraSocialData: ObraSocialUpdateDTO) {
   if (!obraSocialData.id) return;
   
   this.obrasSocialesService.updateObraSocial(obraSocialData.id, obraSocialData).subscribe({
     next: (obraSocialActualizada) => {
       this.modal.finishLoading();
       this.cerrarModal();
       
       Swal.fire({
         title: '¡Obra Social Actualizada!',
         text: 'La obra social ha sido actualizada exitosamente',
         icon: 'success',
         confirmButtonColor: '#198754'
       });
       
       this.cargarObrasSociales();
     },
     error: (err) => {
       this.modal.finishLoading();
       
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
         Swal.fire({
           title: 'Error',
           text: `No se pudo ${accion} la obra social, verifique si tiene pacientes activos con esta obra social`,
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

 debugObrasSociales() {
   console.log('=== DEBUG OBRAS SOCIALES ===');
   console.log('Total obras sociales:', this.obrasSociales().length);
   console.log('Obras sociales:', this.obrasSociales());
   console.log('Estadísticas:', this.estadisticas());
   console.log('============================');
 }
}