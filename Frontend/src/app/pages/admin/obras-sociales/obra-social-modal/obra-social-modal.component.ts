import { Component, input, output, effect, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ObraSocial, ObraSocialCreateDTO, ObraSocialUpdateDTO } from '../../../../interfaces/obraSocial.interface';

export type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-obras-sociales-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './obra-social-modal.component.html',
  styleUrls: ['./obra-social-modal.component.css']
})
export class ObrasSocialesModalComponent implements OnDestroy {
  // Inputs
  isOpen = input<boolean>(false);
  mode = input<ModalMode>('create');
  obraSocial = input<ObraSocial | null>(null);
  existingDescriptions = input<string[]>([]);

  // Outputs
  save = output<ObraSocialCreateDTO | ObraSocialUpdateDTO>();
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
      const obraSocial = this.obraSocial();
      if (obraSocial && this.mode() === 'edit') {
        this.form.patchValue({
          descripcion: obraSocial.descripcion,
          activo: obraSocial.activo
        });
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      descripcion: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      activo: [true]
    });
  }

  private openModal() {
    if (this.mode() === 'create') {
      this.form.reset({
        descripcion: '',
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
      
      // Validar descripción duplicada
      if (this.isDuplicateDescription(formValue.descripcion)) {
        this.form.get('descripcion')?.setErrors({ 'duplicate': true });
        this.loading.set(false);
        return;
      }

      if (this.mode() === 'create') {
        const createDTO: ObraSocialCreateDTO = {
          descripcion: formValue.descripcion.trim(),
          activo: formValue.activo
        };
        this.save.emit(createDTO);
      } else {
        const updateDTO: ObraSocialUpdateDTO = {
          id: this.obraSocial()?.id,
          descripcion: formValue.descripcion.trim(),
          activo: formValue.activo
        };
        this.save.emit(updateDTO);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private isDuplicateDescription(descripcion: string): boolean {
    const normalizedInput = descripcion.trim().toLowerCase();
    const existing = this.existingDescriptions();
    
    if (this.mode() === 'create') {
      return existing.some(desc => desc.toLowerCase() === normalizedInput);
    } else {
      // En modo edición, excluir la descripción actual
      const currentDescription = this.obraSocial()?.descripcion?.toLowerCase();
      return existing.some(desc => 
        desc.toLowerCase() === normalizedInput && desc.toLowerCase() !== currentDescription
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
  get descripcionControl() {
    return this.form.get('descripcion');
  }

  get isDescripcionInvalid() {
    return this.descripcionControl?.invalid && this.descripcionControl?.touched;
  }

  get descripcionErrorMessage(): string {
    const control = this.descripcionControl;
    if (control?.errors) {
      if (control.errors['required']) return 'La descripción es obligatoria';
      if (control.errors['minlength']) return 'La descripción debe tener al menos 3 caracteres';
      if (control.errors['maxlength']) return 'La descripción no puede exceder 100 caracteres';
      if (control.errors['duplicate']) return 'Ya existe una obra social with esa descripción';
    }
    return '';
  }

  get modalTitle(): string {
    return this.mode() === 'create' ? 'Nueva Obra Social' : 'Editar Obra Social';
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