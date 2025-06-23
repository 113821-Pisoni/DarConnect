// src/app/pages/admin/choferes/chofer-modal/chofer-modal.component.ts
import { Component, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChoferService } from '../../../../services/chofer.service';
import { ChoferData, ChoferCreateDTO, ChoferUpdateDTO, UsuarioDisponible } from '../../../../interfaces/chofer.interface';

export type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-chofer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chofer-modal.component.html',
  styleUrls: ['./chofer-modal.component.css']
})
export class ChoferModalComponent {
  private fb = inject(FormBuilder);
  private choferService = inject(ChoferService);

  // Inputs
  isOpen = input<boolean>(false);
  mode = input<ModalMode>('create');
  choferData = input<ChoferData | null>(null);
  usuariosDisponibles = input<UsuarioDisponible[]>([]);

  // Outputs
  onClose = output<void>();
  onSave = output<void>();

  // Signals
  loading = signal(false);
  error = signal<string | null>(null);
  private isVisible = signal(false);

  // Form
  choferForm: FormGroup = this.fb.group({
    idUsuario: ['', [Validators.required]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.maxLength(100)]],
    dni: ['', [Validators.required, Validators.maxLength(20)]],
    telefono: ['', [Validators.maxLength(20)]],
    direccion: ['', [Validators.maxLength(255)]],
    fechaVencimientoLicencia: ['', [Validators.required]],
    fechaContratacion: ['']
  });

  constructor() {
    // Effect para manejar la apertura/cierre del modal
    effect(() => {
      if (this.isOpen()) {
        this.openModal();
      } else {
        this.closeModal();
      }
    });

    // Effect para cargar datos cuando cambia el chofer
    effect(() => {
      const chofer = this.choferData();
      const mode = this.mode();
      
      if (chofer && mode === 'edit') {
        this.loadChoferData(chofer);
      } else if (mode === 'create') {
        this.resetForm();
      }
    });
  }

  private openModal() {
    this.isVisible.set(true);
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    this.error.set(null);
  }

  private closeModal() {
    this.isVisible.set(false);
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    this.resetForm();
  }

  private loadChoferData(chofer: ChoferData) {  
    const fechaVencimiento = this.convertArrayToDateString(chofer.fechaVencimientoLicencia);
    const fechaContratacion = chofer.fechaContratacion ? this.convertArrayToDateString(chofer.fechaContratacion) : '';
    
    
    this.choferForm.patchValue({
      idUsuario: chofer.idUsuario,
      nombre: chofer.nombre,
      apellido: chofer.apellido,
      dni: chofer.dni,
      telefono: chofer.telefono || '',
      direccion: chofer.direccion || '',
      fechaVencimientoLicencia: fechaVencimiento,
      fechaContratacion: fechaContratacion
    });

    // En modo edición, el usuario no se puede cambiar
    if (this.mode() === 'edit') {
      this.choferForm.get('idUsuario')?.disable();
    }
    
  }

  private resetForm() {
    this.choferForm.reset();
    this.choferForm.get('idUsuario')?.enable();
    this.error.set(null);
  }

  handleBackdropClick(event: Event) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal')) {
      this.close();
    }
  }

  close() {
    this.onClose.emit();
  }

  async onSubmit() {
    
    if (this.choferForm.invalid) {
      this.choferForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const formValue = this.choferForm.value;
      
      if (this.mode() === 'create') {
        const createDTO: ChoferCreateDTO = {
          idUsuario: parseInt(formValue.idUsuario),
          nombre: formValue.nombre,
          apellido: formValue.apellido,
          dni: formValue.dni,
          telefono: formValue.telefono || undefined,
          direccion: formValue.direccion || undefined,
          fechaVencimientoLicencia: formValue.fechaVencimientoLicencia,
          fechaContratacion: formValue.fechaContratacion || undefined
        };
        
        await this.choferService.createChofer(createDTO).toPromise();
      } else {
        
        const chofer = this.choferData();
        
        if (!chofer) {
          console.error('Error: No hay datos del chofer');
          this.error.set('No se puede actualizar: Datos del chofer no disponibles');
          return;
        }
        
        if (!chofer.id) {
          console.error('Error: Chofer sin ID', chofer);
          this.error.set('No se puede actualizar: ID del chofer no válido');
          return;
        }

        const updateDTO: ChoferUpdateDTO = {
          id: chofer.id,  
          nombre: formValue.nombre,
          apellido: formValue.apellido,
          dni: formValue.dni,
          telefono: formValue.telefono || undefined,
          direccion: formValue.direccion || undefined,
          fechaVencimientoLicencia: formValue.fechaVencimientoLicencia,
          fechaContratacion: formValue.fechaContratacion || undefined
        };
        
        await this.choferService.updateChofer(chofer.id, updateDTO).toPromise();
      }

      this.onSave.emit();
    } catch (err: any) {
      console.error('=== ERROR AL GUARDAR ===');
      console.error('Error completo:', err);
      console.error('Status:', err.status);
      console.error('Error message:', err.error);
      this.error.set(err.error?.message || 'Error al guardar el chofer');
    } finally {
      this.loading.set(false);
    }
  }

  // Getters para el template
  getModalTitle(): string {
    return this.mode() === 'create' ? 'Nuevo Chofer' : 'Editar Chofer';
  }

  getSubmitButtonText(): string {
    return this.mode() === 'create' ? 'Crear' : 'Actualizar';
  }

  getIsVisible(): boolean {
    return this.isVisible();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.choferForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.choferForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es obligatorio`;
      if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} es muy largo`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      idUsuario: 'Usuario',
      nombre: 'Nombre',
      apellido: 'Apellido',
      dni: 'DNI',
      telefono: 'Teléfono',
      direccion: 'Dirección',
      fechaVencimientoLicencia: 'Fecha de vencimiento de licencia',
      fechaContratacion: 'Fecha de contratación'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Convierte array de fecha [año, mes, día] a string formato yyyy-MM-dd
   */
  private convertArrayToDateString(dateArray: any): string {
    if (!dateArray) return '';
    
    // Si ya es string, devolverlo tal como está
    if (typeof dateArray === 'string') return dateArray;
    
    // Si es array [año, mes, día]
    if (Array.isArray(dateArray) && dateArray.length === 3) {
      const [year, month, day] = dateArray;
      // El mes viene 1-indexed desde el backend, mantenerlo tal como está
      const monthStr = String(month).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      return `${year}-${monthStr}-${dayStr}`;
    }
    
    return '';
  }
}