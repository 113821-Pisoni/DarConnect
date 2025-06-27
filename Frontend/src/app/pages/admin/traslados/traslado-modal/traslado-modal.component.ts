import { Component, input, output, effect, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TrasladoDTO, TrasladoCreateDTO, TrasladoUpdateDTO, DiaSemana } from '../../../../interfaces/traslado.interface';
import { Agenda } from '../../../../interfaces/agenda.interface';
import { Paciente } from '../../../../interfaces/paciente.interface';

export type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-traslados-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './traslado-modal.component.html',
  styleUrls: ['./traslado-modal.component.css']
})
export class TrasladosModalComponent implements OnDestroy {
  // Inputs
  isOpen = input<boolean>(false);
  mode = input<ModalMode>('create');
  traslado = input<TrasladoDTO | null>(null);
  agendas = input<Agenda[]>([]);
  pacientes = input<Paciente[]>([]);

  // Outputs
  save = output<TrasladoCreateDTO | TrasladoUpdateDTO>();
  close = output<void>();

  // Signals
  loading = signal(false);
  form: FormGroup;
  
  // Días de la semana
  diasSemana = signal<DiaSemana[]>([
    { id: 1, nombre: 'Lunes', seleccionado: false },
    { id: 2, nombre: 'Martes', seleccionado: false },
    { id: 3, nombre: 'Miércoles', seleccionado: false },
    { id: 4, nombre: 'Jueves', seleccionado: false },
    { id: 5, nombre: 'Viernes', seleccionado: false },
    { id: 6, nombre: 'Sábado', seleccionado: false },
    { id: 7, nombre: 'Domingo', seleccionado: false }
  ]);

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

    // Effect para manejar loading state
    effect(() => {
      if (this.loading()) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });

    // Effect para llenar el formulario cuando cambia el dato
    effect(() => {
      const traslado = this.traslado();
      if (traslado && this.mode() === 'edit') {
        
        this.form.patchValue({
          idAgenda: traslado.idAgenda,
          idPaciente: traslado.idPaciente,
          direccionOrigen: traslado.direccionOrigen,
          direccionDestino: traslado.direccionDestino,
          horaProgramada: this.formatearHoraParaInput(traslado.horaProgramada),
          fechaInicio: this.convertArrayToDateString(traslado.fechaInicio),
          fechaFin: this.convertArrayToDateString(traslado.fechaFin),
          observaciones: traslado.observaciones || '',
          activo: traslado.activo
        });
        
        // Configurar días seleccionados
        this.configurarDiasSeleccionados(traslado.diasSemana);
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      idAgenda: ['', [Validators.required]],
      idPaciente: ['', [Validators.required]],
      direccionOrigen: ['', [
        Validators.required,
        Validators.maxLength(255)
      ]],
      direccionDestino: ['', [
        Validators.required,
        Validators.maxLength(255)
      ]],
      horaProgramada: ['', [Validators.required]],
      fechaInicio: ['', [Validators.required]],
      fechaFin: [''],
      observaciones: ['', [Validators.maxLength(500)]],
      activo: [true]
    });
  }

  private openModal() {
    if (this.mode() === 'create') {
      this.form.reset({
        idAgenda: '',
        idPaciente: '',
        direccionOrigen: '',
        direccionDestino: '',
        horaProgramada: '',
        fechaInicio: '',
        fechaFin: '',
        observaciones: '',
        activo: true
      });
      this.resetDiasSemana();
    }
    document.body.classList.add('modal-open');
  }

  private closeModal() {
    this.form.reset();
    this.resetDiasSemana();
    document.body.classList.remove('modal-open');
  }

  private convertArrayToDateString(dateArray: any): string {
    if (!dateArray) return '';
    if (typeof dateArray === 'string') return dateArray;
    if (Array.isArray(dateArray) && dateArray.length === 3) {
      const [year, month, day] = dateArray;
      const monthStr = String(month).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      return `${year}-${monthStr}-${dayStr}`;
    }
    return '';
  }

  private formatearHoraParaInput(hora: string | any): string {
    if (!hora) return '';
    
    // Si es string, tomar solo HH:mm
    if (typeof hora === 'string') {
      if (hora.includes(':')) {
        const partes = hora.split(':');
        if (partes.length >= 2) {
          return `${partes[0]}:${partes[1]}`;
        }
      }
      return hora;
    }
    
    // Si es array [hour, minute, second]
    if (Array.isArray(hora) && hora.length >= 2) {
      const h = hora[0].toString().padStart(2, '0');
      const m = hora[1].toString().padStart(2, '0');
      return `${h}:${m}`;
    }
    
    // Si es objeto {hour, minute, second}
    if (typeof hora === 'object' && hora.hour !== undefined && hora.minute !== undefined) {
      const h = hora.hour.toString().padStart(2, '0');
      const m = hora.minute.toString().padStart(2, '0');
      return `${h}:${m}`;
    }
    
    console.warn('Formato de hora no reconocido:', hora); // DEBUG
    return '';
  }

  onSubmit() {
    if (this.form.valid && this.validarDiasSeleccionados()) {
      this.loading.set(true);
      
      const formValue = this.form.value;
      const diasSeleccionados = this.obtenerDiasSeleccionados();
      
      if (this.mode() === 'create') {
        const createDTO: TrasladoCreateDTO = {
          idAgenda: parseInt(formValue.idAgenda),
          idPaciente: parseInt(formValue.idPaciente),
          direccionOrigen: formValue.direccionOrigen.trim(),
          direccionDestino: formValue.direccionDestino.trim(),
          horaProgramada: formValue.horaProgramada + ':00', // Agregar segundos
          diasSemana: diasSeleccionados.join(','),
          fechaInicio: formValue.fechaInicio,
          fechaFin: formValue.fechaFin || undefined,
          observaciones: formValue.observaciones?.trim() || undefined
        };
        this.save.emit(createDTO);
      } else {
        const updateDTO: TrasladoUpdateDTO = {
          id: this.traslado()?.id,
          idAgenda: parseInt(formValue.idAgenda),
          idPaciente: parseInt(formValue.idPaciente),
          direccionOrigen: formValue.direccionOrigen.trim(),
          direccionDestino: formValue.direccionDestino.trim(),
          horaProgramada: formValue.horaProgramada + ':00',
          diasSemana: diasSeleccionados.join(','),
          fechaInicio: formValue.fechaInicio,
          fechaFin: formValue.fechaFin || undefined,
          observaciones: formValue.observaciones?.trim() || undefined,
          activo: formValue.activo
        };
        this.save.emit(updateDTO);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private validarDiasSeleccionados(): boolean {
    const diasSeleccionados = this.diasSemana().filter(dia => dia.seleccionado);
    return diasSeleccionados.length > 0;
  }

  private obtenerDiasSeleccionados(): number[] {
    return this.diasSemana()
      .filter(dia => dia.seleccionado)
      .map(dia => dia.id);
  }

  private configurarDiasSeleccionados(diasString: string) {
    this.resetDiasSemana();
    if (diasString) {
      const diasNumeros = diasString.split(',').map(d => parseInt(d.trim()));
      this.diasSemana.update(dias => 
        dias.map(dia => ({
          ...dia,
          seleccionado: diasNumeros.includes(dia.id)
        }))
      );
    }
  }

  private resetDiasSemana() {
    this.diasSemana.update(dias => 
      dias.map(dia => ({ ...dia, seleccionado: false }))
    );
  }

  private markFormGroupTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  onDiaChange(diaId: number, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.diasSemana.update(dias => 
      dias.map(dia => 
        dia.id === diaId ? { ...dia, seleccionado: checkbox.checked } : dia
      )
    );
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
  get agendaControl() { return this.form.get('idAgenda'); }
  get pacienteControl() { return this.form.get('idPaciente'); }
  get direccionOrigenControl() { return this.form.get('direccionOrigen'); }
  get direccionDestinoControl() { return this.form.get('direccionDestino'); }
  get horaProgramadaControl() { return this.form.get('horaProgramada'); }
  get fechaInicioControl() { return this.form.get('fechaInicio'); }
  get fechaFinControl() { return this.form.get('fechaFin'); }
  get observacionesControl() { return this.form.get('observaciones'); }

  get isAgendaInvalid() { return this.agendaControl?.invalid && this.agendaControl?.touched; }
  get isPacienteInvalid() { return this.pacienteControl?.invalid && this.pacienteControl?.touched; }
  get isDireccionOrigenInvalid() { return this.direccionOrigenControl?.invalid && this.direccionOrigenControl?.touched; }
  get isDireccionDestinoInvalid() { return this.direccionDestinoControl?.invalid && this.direccionDestinoControl?.touched; }
  get isHoraProgramadaInvalid() { return this.horaProgramadaControl?.invalid && this.horaProgramadaControl?.touched; }
  get isFechaInicioInvalid() { return this.fechaInicioControl?.invalid && this.fechaInicioControl?.touched; }
  get isFechaFinInvalid() { return this.fechaFinControl?.invalid && this.fechaFinControl?.touched; }
  get isObservacionesInvalid() { return this.observacionesControl?.invalid && this.observacionesControl?.touched; }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) return `${this.getFieldLabel(controlName)} es obligatorio`;
      if (control.errors['maxlength']) return `${this.getFieldLabel(controlName)} no puede exceder ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }

  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      'idAgenda': 'La agenda',
      'idPaciente': 'El paciente',
      'direccionOrigen': 'La dirección de origen',
      'direccionDestino': 'La dirección de destino',
      'horaProgramada': 'La hora',
      'fechaInicio': 'La fecha de inicio',
      'observaciones': 'Las observaciones'
    };
    return labels[controlName] || 'El campo';
  }

  // Validation para fechas
  validarFechas(): string | null {
    const fechaInicio = this.fechaInicioControl?.value;
    const fechaFin = this.fechaFinControl?.value;
    
    if (fechaFin && fechaInicio && fechaFin <= fechaInicio) {
      return 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    
    return null;
  }

  get modalTitle(): string {
    return this.mode() === 'create' ? 'Nuevo Traslado' : 'Editar Traslado';
  }

  get submitButtonText(): string {
    return this.mode() === 'create' ? 'Crear' : 'Actualizar';
  }

  get tieneDiasSeleccionados(): boolean {
    return this.diasSemana().some(dia => dia.seleccionado);
  }

  // Helper para mostrar información
  getAgendaDisplayText(agenda: Agenda): string {
    return `Agenda de ${agenda.nombreChofer} ${agenda.apellidoChofer}`;
  }

  getPacienteDisplayText(paciente: Paciente): string {
    return `${paciente.nombre} ${paciente.apellido} - DNI: ${paciente.dni}`;
  }

  ngOnDestroy() {
    document.body.classList.remove('modal-open');
  }

  // Método para finalizar loading desde el componente padre
  finishLoading() {
    this.loading.set(false);
  }
}