import { Component, input, output, effect, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgendaCreateDTO } from '../../../../interfaces/agenda.interface';
import { ChoferData } from '../../../../interfaces/chofer.interface';

@Component({
  selector: 'app-agendas-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agenda-modal.component.html',
  styleUrls: ['./agenda-modal.component.css']
})
export class AgendasModalComponent implements OnDestroy {
  // Inputs
  isOpen = input<boolean>(false);
  choferesDisponibles = input<ChoferData[]>([]);

  // Outputs
  save = output<AgendaCreateDTO>();
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
  }

  private createForm(): FormGroup {
    return this.fb.group({
      idChofer: ['', [Validators.required]]
    });
  }

  private openModal() {
    this.form.reset({
      idChofer: ''
    });
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
      
      const createDTO: AgendaCreateDTO = {
        idChofer: parseInt(formValue.idChofer)
      };
      
      this.save.emit(createDTO);
    } else {
      this.markFormGroupTouched();
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
  get choferControl() {
    return this.form.get('idChofer');
  }

  get isChoferInvalid() {
    return this.choferControl?.invalid && this.choferControl?.touched;
  }

  get choferErrorMessage(): string {
    const control = this.choferControl;
    if (control?.errors) {
      if (control.errors['required']) return 'Debe seleccionar un chofer';
    }
    return '';
  }

  // Helper para mostrar información del chofer
  getChoferDisplayText(chofer: ChoferData): string {
    return `${chofer.nombre} ${chofer.apellido} - DNI: ${chofer.dni}`;
  }

  ngOnDestroy() {
    document.body.classList.remove('modal-open');
  }

  // Método para finalizar loading desde el componente padre
  finishLoading() {
    this.loading.set(false);
  }
}