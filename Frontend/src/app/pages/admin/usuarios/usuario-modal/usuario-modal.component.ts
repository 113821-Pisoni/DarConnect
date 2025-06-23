// src/app/components/usuario-modal/usuario-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Usuario, UsuarioCreateDTO, UsuarioUpdateDTO, RolUsuario } from '../../../../interfaces/usuario.interface';

@Component({
  selector: 'app-usuario-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-modal.component.html',
  styleUrls: ['./usuario-modal.component.css']
})
export class UsuarioModalComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() usuario: Usuario | null = null;
  @Input() modalType: 'create' | 'edit' | 'password' = 'create';
  
  @Output() modalClose = new EventEmitter<void>();
  @Output() usuarioSubmit = new EventEmitter<UsuarioCreateDTO | { id: number, data: UsuarioUpdateDTO }>();
  @Output() passwordSubmit = new EventEmitter<{ id: number, password: string }>();

  usuarioForm!: FormGroup;
  loading = signal(false);
  showPassword = signal(false);
  
  RolUsuario = RolUsuario;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
    if (this.usuario && this.modalType === 'edit') {
      this.loadUsuarioData();
    }
  }

  ngOnChanges() {
    if (this.usuarioForm) {
      this.initForm();
      if (this.usuario && this.modalType === 'edit') {
        this.loadUsuarioData();
      }
    }
  }

  private initForm() {
    if (this.modalType === 'password') {
      this.usuarioForm = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8)]]
      });
    } else {
      this.usuarioForm = this.fb.group({
        usuario: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', this.modalType === 'create' ? [Validators.required, Validators.minLength(8)] : []],
        rol: [RolUsuario.CHOFER, [Validators.required]],
        activo: [true]
      });
    }
  }

  private loadUsuarioData() {
    if (this.usuario) {
      this.usuarioForm.patchValue({
        usuario: this.usuario.usuario,
        rol: this.usuario.rol,
        activo: this.usuario.activo
      });
    }
  }

  onSubmit() {
    if (this.usuarioForm.valid && !this.loading()) {
      this.loading.set(true);
      
      if (this.modalType === 'password' && this.usuario) {
        const password = this.usuarioForm.get('password')?.value;
        this.passwordSubmit.emit({ 
          id: this.usuario.id!, 
          password 
        });
      } else if (this.modalType === 'create') {
        const formData = this.usuarioForm.value;
        const nuevoUsuario: UsuarioCreateDTO = {
          usuario: formData.usuario,
          password: formData.password,
          rol: formData.rol,
          activo: true // Siempre activo al crear
        };
        this.usuarioSubmit.emit(nuevoUsuario);
      } else if (this.modalType === 'edit' && this.usuario) {
        const formData = this.usuarioForm.value;
        const usuarioEditado: UsuarioUpdateDTO = {
          usuario: formData.usuario,
          rol: formData.rol,
          activo: formData.activo
        };
        // Si hay password, lo incluimos
        if (formData.password && formData.password.trim()) {
          this.passwordSubmit.emit({ 
            id: this.usuario.id!, 
            password: formData.password 
          });
        }
        this.usuarioSubmit.emit({
          id: this.usuario.id!,
          data: usuarioEditado
        });
      }
    }
  }

  onCancel() {
    this.resetForm();
    this.modalClose.emit();
  }

  private resetForm() {
    this.usuarioForm.reset();
    this.loading.set(false);
    
    if (this.modalType !== 'password') {
      this.usuarioForm.patchValue({
        rol: RolUsuario.CHOFER,
        activo: true
      });
    }
  }

  get usuarioControl() { return this.usuarioForm.get('usuario'); }
  get passwordControl() { return this.usuarioForm.get('password'); }
  get rolControl() { return this.usuarioForm.get('rol'); }
  get activoControl() { return this.usuarioForm.get('activo'); }

  getModalTitle(): string {
    switch (this.modalType) {
      case 'create':
        return 'Nuevo Usuario';
      case 'edit':
        return `Editar Usuario: ${this.usuario?.usuario || ''}`;
      case 'password':
        return `Cambiar Contraseña: ${this.usuario?.usuario || ''}`;
      default:
        return 'Usuario';
    }
  }

  getSubmitButtonText(): string {
    switch (this.modalType) {
      case 'create':
        return 'Crear Usuario';
      case 'edit':
        return 'Actualizar Usuario';
      case 'password':
        return 'Cambiar Contraseña';
      default:
        return 'Guardar';
    }
  }

  setLoading(loading: boolean) {
    this.loading.set(loading);
  }

  closeModal() {
    this.resetForm();
    this.modalClose.emit();
  }

  togglePasswordVisibility() {
  this.showPassword.set(!this.showPassword());
}
}