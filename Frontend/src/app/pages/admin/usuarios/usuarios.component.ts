// src/app/pages/admin/usuarios/usuarios.component.ts
import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../../services/usuarios.service';
import { Usuario, UsuarioCreateDTO, UsuarioUpdateDTO, RolUsuario } from '../../../interfaces/usuario.interface';
import { UsuarioModalComponent } from '../../../pages/admin/usuarios/usuario-modal/usuario-modal.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, UsuarioModalComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  @ViewChild(UsuarioModalComponent) usuarioModal!: UsuarioModalComponent;

  // Signals
  usuarios = signal<Usuario[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filtroActivo = signal('TODOS');

  // Modal state
  modalVisible = signal(false);
  modalType = signal<'create' | 'edit' | 'password'>('create');
  usuarioSeleccionado = signal<Usuario | null>(null);

  // Computed
  usuariosFiltrados = computed(() => {
    const filtro = this.filtroActivo();
    if (filtro === 'TODOS') {
      return this.usuarios();
    }
    return this.usuarios().filter(u => {
      if (filtro === 'ACTIVOS') return u.activo;
      if (filtro === 'INACTIVOS') return !u.activo;
      if (filtro === 'ADMINISTRADOR') return u.rol === RolUsuario.ADMINISTRADOR;
      if (filtro === 'CHOFER') return u.rol === RolUsuario.CHOFER;
      return true;
    });
  });

  estadisticas = computed(() => {
    const total = this.usuarios().length;
    const activos = this.usuarios().filter(u => u.activo).length;
    const inactivos = total - activos;
    const administradores = this.usuarios().filter(u => u.rol === RolUsuario.ADMINISTRADOR).length;
    const choferes = this.usuarios().filter(u => u.rol === RolUsuario.CHOFER).length;
    
    return { total, activos, inactivos, administradores, choferes };
  });

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loading.set(true);
    this.error.set(null);
    
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los usuarios');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
  }

  cambiarFiltro(filtro: string) {
    this.filtroActivo.set(filtro);
  }

  // Métodos del modal
  abrirModalCrear() {
    this.modalType.set('create');
    this.usuarioSeleccionado.set(null);
    this.modalVisible.set(true);
  }

  abrirModalEditar(usuario: Usuario) {
    this.modalType.set('edit');
    this.usuarioSeleccionado.set(usuario);
    this.modalVisible.set(true);
  }

  abrirModalPassword(usuario: Usuario) {
    this.modalType.set('password');
    this.usuarioSeleccionado.set(usuario);
    this.modalVisible.set(true);
  }

  cerrarModal() {
    this.modalVisible.set(false);
    this.usuarioSeleccionado.set(null);
  }

  // Handlers del modal
  onUsuarioSubmit(data: UsuarioCreateDTO | { id: number, data: UsuarioUpdateDTO }) {
    if (this.modalType() === 'create') {
      this.crearUsuario(data as UsuarioCreateDTO);
    } else if (this.modalType() === 'edit') {
      this.editarUsuario(data as { id: number, data: UsuarioUpdateDTO });
    }
  }

  onPasswordSubmit(data: { id: number, password: string }) {
    this.resetPassword(data.id, data.password);
  }

  private crearUsuario(nuevoUsuario: UsuarioCreateDTO) {
    this.usuariosService.createUsuario(nuevoUsuario).subscribe({
      next: () => {
        Swal.fire({
          title: '¡Usuario Creado!',
          text: 'El usuario ha sido creado exitosamente',
          icon: 'success',
          confirmButtonColor: '#198754',
          timer: 2000,
          showConfirmButton: false
        });
        this.usuarioModal?.closeModal();
        this.cerrarModal();
        this.cargarUsuarios();
      },
      error: (err) => {
        this.usuarioModal?.setLoading(false);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo crear el usuario. ' + (err.error?.message || 'Intente nuevamente.'),
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  private editarUsuario(data: { id: number, data: UsuarioUpdateDTO }) {
    this.usuariosService.updateUsuario(data.id, data.data).subscribe({
      next: () => {
        Swal.fire({
          title: '¡Usuario Actualizado!',
          text: 'El usuario ha sido actualizado exitosamente',
          icon: 'success',
          confirmButtonColor: '#198754',
          timer: 2000,
          showConfirmButton: false
        });
        this.usuarioModal?.closeModal();
        this.cerrarModal();
        this.cargarUsuarios();
      },
      error: (err) => {
        this.usuarioModal?.setLoading(false);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar el usuario. ' + (err.error?.message || 'Intente nuevamente.'),
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  private resetPassword(id: number, password: string) {
    this.usuariosService.resetPassword(id, password).subscribe({
      next: () => {
        // Si viene del modal de edición, no mostrar mensaje porque ya se muestra el de actualización
        if (this.modalType() === 'password') {
          Swal.fire({
            title: '¡Contraseña Cambiada!',
            text: 'La contraseña ha sido actualizada exitosamente',
            icon: 'success',
            confirmButtonColor: '#198754',
            timer: 2000,
            showConfirmButton: false
          });
          this.usuarioModal?.closeModal();
          this.cerrarModal();
        }
      },
      error: (err) => {
        this.usuarioModal?.setLoading(false);
        if (this.modalType() === 'password') {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo cambiar la contraseña',
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
        console.error('Error:', err);
      }
    });
  }

  async toggleEstado(usuario: Usuario) {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    const result = await Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
      text: `¿Está seguro que desea ${accion} el usuario ${usuario.usuario}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: usuario.activo ? '#dc3545' : '#198754'
    });

    if (result.isConfirmed) {
      this.usuariosService.toggleEstadoUsuario(usuario.id!).subscribe({
        next: () => {
          Swal.fire({
            title: `¡Usuario ${accion === 'activar' ? 'Activado' : 'Desactivado'}!`,
            text: `El usuario ha sido ${accion === 'activar' ? 'activado' : 'desactivado'} exitosamente`,
            icon: 'success',
            confirmButtonColor: '#198754',
            timer: 2000,
            showConfirmButton: false
          });
          this.cargarUsuarios();
        },
        error: (err) => {
          Swal.fire({
            title: 'Error',
            text: `No se pudo ${accion} el usuario`,
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
          console.error('Error:', err);
        }
      });
    }
  }

  getRolBadgeClass(rol: RolUsuario): string {
    return rol === RolUsuario.ADMINISTRADOR ? 'badge bg-danger' : 'badge bg-primary';
  }

  getEstadoBadgeClass(activo: boolean): string {
    return activo ? 'badge bg-success' : 'badge bg-secondary';
  }
}