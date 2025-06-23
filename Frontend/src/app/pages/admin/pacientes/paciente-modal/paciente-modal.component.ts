import { Component, input, output, effect, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Paciente, PacienteCreateDTO, PacienteUpdateDTO } from '../../../../interfaces/paciente.interface';
import { ObraSocial } from '../../../../interfaces/obraSocial.interface';

export type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-pacientes-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paciente-modal.component.html',
  styleUrls: ['./paciente-modal.component.css']
})
export class PacientesModalComponent implements OnDestroy {
  // Inputs
  isOpen = input<boolean>(false);
  mode = input<ModalMode>('create');
  paciente = input<Paciente | null>(null);
  obrasSociales = input<ObraSocial[]>([]);
  existingDnis = input<string[]>([]);

  // Outputs
  save = output<PacienteCreateDTO | PacienteUpdateDTO>();
  close = output<void>();

  // Signals
  loading = signal(false);
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.createForm();
    
    // Effect para manejar apertura/cierre del modal
    effect(() => {
      if (this.isOpen()) {
        this.openModal();
      } else {
        this.closeModal();
      }
    });

    // Effect para llenar el formulario cuando cambia el dato
    effect(() => {
      const paciente = this.paciente();
      if (paciente && this.mode() === 'edit') {
        this.form.patchValue({
          nombre: paciente.nombre,
          apellido: paciente.apellido,
          dni: paciente.dni,
          telefono: paciente.telefono || '',
          email: paciente.email || '',
          direccion: paciente.direccion || '',
          ciudad: paciente.ciudad || '',
          idObraSocial: paciente.idObraSocial || '',
          sillaRueda: paciente.sillaRueda,
          activo: paciente.activo
        });
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      apellido: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      dni: ['', [
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(20)
      ]],
      telefono: ['', [
        Validators.maxLength(20)
      ]],
      email: ['', [
        Validators.email,
        Validators.maxLength(255)
      ]],
      direccion: ['', [
        Validators.maxLength(255)
      ]],
      ciudad: ['', [
        Validators.maxLength(100)
      ]],
      idObraSocial: [''],
      sillaRueda: [false],
      activo: [true]
    });
  }

  private openModal() {
    if (this.mode() === 'create') {
      this.form.reset({
        nombre: '',
        apellido: '',
        dni: '',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: '',
        idObraSocial: '',
        sillaRueda: false,
        activo: true
      });
    }
    document.body.classList.add('modal-open');
  }

  private closeModal() {
    this.form.reset();
    document.body.classList.remove('modal-open');
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading.set(true);
      
      const formValue = this.form.value;
      
      // Validar DNI duplicado
      if (this.isDuplicateDni(formValue.dni)) {
        this.form.get('dni')?.setErrors({ 'duplicate': true });
        this.loading.set(false);
        return;
      }

      if (this.mode() === 'create') {
        const createDTO: PacienteCreateDTO = {
          nombre: formValue.nombre.trim(),
          apellido: formValue.apellido.trim(),
          dni: formValue.dni.trim(),
          telefono: formValue.telefono?.trim() || undefined,
          email: formValue.email?.trim() || undefined,
          direccion: formValue.direccion?.trim() || undefined,
          ciudad: formValue.ciudad?.trim() || undefined,
          idObraSocial: formValue.idObraSocial ? parseInt(formValue.idObraSocial) : null,
          sillaRueda: formValue.sillaRueda,
          activo: formValue.activo
        };
        this.save.emit(createDTO);
      } else {
        const updateDTO: PacienteUpdateDTO = {
          id: this.paciente()?.id,
          nombre: formValue.nombre.trim(),
          apellido: formValue.apellido.trim(),
          dni: formValue.dni.trim(),
          telefono: formValue.telefono?.trim() || undefined,
          email: formValue.email?.trim() || undefined,
          direccion: formValue.direccion?.trim() || undefined,
          ciudad: formValue.ciudad?.trim() || undefined,
          idObraSocial: formValue.idObraSocial ? parseInt(formValue.idObraSocial) : null,
          sillaRueda: formValue.sillaRueda,
          activo: formValue.activo
        };
        this.save.emit(updateDTO);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private isDuplicateDni(dni: string): boolean {
    const normalizedInput = dni.trim().toLowerCase();
    const existing = this.existingDnis();
    
    if (this.mode() === 'create') {
      return existing.some(existingDni => existingDni.toLowerCase() === normalizedInput);
    } else {
      // En modo edición, excluir el DNI actual
      const currentDni = this.paciente()?.dni?.toLowerCase();
      return existing.some(existingDni => 
        existingDni.toLowerCase() === normalizedInput && existingDni.toLowerCase() !== currentDni
      );
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  onCancel() {
    this.close.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  // Getters para validaciones
  get nombreControl() { return this.form.get('nombre'); }
  get apellidoControl() { return this.form.get('apellido'); }
  get dniControl() { return this.form.get('dni'); }
  get telefonoControl() { return this.form.get('telefono'); }
  get emailControl() { return this.form.get('email'); }
  get direccionControl() { return this.form.get('direccion'); }
  get ciudadControl() { return this.form.get('ciudad'); }

  get isNombreInvalid() { return this.nombreControl?.invalid && this.nombreControl?.touched; }
  get isApellidoInvalid() { return this.apellidoControl?.invalid && this.apellidoControl?.touched; }
  get isDniInvalid() { return this.dniControl?.invalid && this.dniControl?.touched; }
  get isTelefonoInvalid() { return this.telefonoControl?.invalid && this.telefonoControl?.touched; }
  get isEmailInvalid() { return this.emailControl?.invalid && this.emailControl?.touched; }
  get isDireccionInvalid() { return this.direccionControl?.invalid && this.direccionControl?.touched; }
  get isCiudadInvalid() { return this.ciudadControl?.invalid && this.ciudadControl?.touched; }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) return `${this.getFieldLabel(controlName)} es obligatorio`;
      if (control.errors['minlength']) return `${this.getFieldLabel(controlName)} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['maxlength']) return `${this.getFieldLabel(controlName)} no puede exceder ${control.errors['maxlength'].requiredLength} caracteres`;
      if (control.errors['email']) return 'El formato del email no es válido';
      if (control.errors['duplicate']) return 'Ya existe un paciente con este DNI';
    }
    return '';
  }

  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      'nombre': 'El nombre',
      'apellido': 'El apellido',
      'dni': 'El DNI',
      'telefono': 'El teléfono',
      'email': 'El email',
      'direccion': 'La dirección',
      'ciudad': 'La ciudad'
    };
    return labels[controlName] || 'El campo';
  }

  get modalTitle(): string {
    return this.mode() === 'create' ? 'Nuevo Paciente' : 'Editar Paciente';
  }

  get submitButtonText(): string {
    return this.mode() === 'create' ? 'Crear' : 'Actualizar';
  }

  ngOnDestroy() {
    document.body.classList.remove('modal-open');
  }

  // Método para finalizar loading desde el componente padre
  finishLoading() {
    this.loading.set(false);
  }
}