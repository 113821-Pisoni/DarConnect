// src/app/pages/admin/usuarios/usuarios.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../../services/usuarios.service';
import { Usuario, UsuarioCreateDTO, RolUsuario } from '../../../interfaces/usuario.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  // Signals
  usuarios = signal<Usuario[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filtroActivo = signal('TODOS');

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
        console.log('Usuarios recibidos del backend:', usuarios); // DEBUG
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

  async crearUsuario() {
    const { value: formValues } = await Swal.fire({
      title: 'Nuevo Usuario',
      html: `
        <div class="text-start mt-3">
          <div class="form-floating mb-3">
            <input type="text" class="form-control" id="usuario" placeholder="Usuario">
            <label for="usuario"><i class="bi bi-person me-2"></i>Usuario</label>
          </div>
          
          <div class="form-floating mb-3">
            <input type="password" class="form-control" id="password" placeholder="Contraseña">
            <label for="password"><i class="bi bi-key me-2"></i>Contraseña</label>
          </div>
          
          <div class="form-floating mb-4">
            <select class="form-select" id="rol">
              <option value="CHOFER" selected>Chofer</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
            <label for="rol"><i class="bi bi-shield me-2"></i>Rol</label>
          </div>
        </div>
      `,
      width: '400px',
      showCancelButton: true,
      confirmButtonText: '<i class="bi bi-check me-1"></i>Crear',
      cancelButtonText: '<i class="bi bi-x me-1"></i>Cancelar',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'rounded-3',
        title: 'fw-bold text-dark',
        confirmButton: 'px-4',
        cancelButton: 'px-4'
      },
      preConfirm: () => {
        const usuario = (document.getElementById('usuario') as HTMLInputElement).value.trim();
        const password = (document.getElementById('password') as HTMLInputElement).value;
        const rol = (document.getElementById('rol') as HTMLSelectElement).value;
        
        if (!usuario) {
          Swal.showValidationMessage('El usuario es obligatorio');
          return false;
        }
        if (!password || password.length < 8) {
          Swal.showValidationMessage('La contraseña debe tener mínimo 8 caracteres');
          return false;
        }
        
        return { usuario, password, rol: rol as RolUsuario, activo: true };
      }
    });

    if (formValues) {
      this.loading.set(true);
      
      const nuevoUsuario: UsuarioCreateDTO = {
        usuario: formValues.usuario,
        password: formValues.password,
        rol: formValues.rol,
        activo: true
      };

      this.usuariosService.createUsuario(nuevoUsuario).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Usuario Creado!',
            text: 'El usuario ha sido creado exitosamente',
            icon: 'success',
            confirmButtonColor: '#198754'
          });
          this.cargarUsuarios();
        },
        error: (err) => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo crear el usuario. ' + (err.error?.message || 'Intente nuevamente.'),
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
          this.loading.set(false);
        }
      });
    }
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
            confirmButtonColor: '#198754'
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

  async resetPassword(usuario: Usuario) {
    const { value: password } = await Swal.fire({
      title: 'Resetear Contraseña',
      text: `Cambiar contraseña para: ${usuario.usuario}`,
      input: 'password',
      inputPlaceholder: 'Nueva contraseña (mínimo 8 caracteres)',
      showCancelButton: true,
      confirmButtonText: 'Cambiar Contraseña',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#198754',
      inputValidator: (value) => {
        if (!value || value.length < 8) {
          return 'La contraseña debe tener al menos 8 caracteres';
        }
        return null;
      }
    });

    if (password) {
      this.usuariosService.resetPassword(usuario.id!, password).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Contraseña Cambiada!',
            text: 'La contraseña ha sido actualizada exitosamente',
            icon: 'success',
            confirmButtonColor: '#198754'
          });
        },
        error: (err) => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo cambiar la contraseña',
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