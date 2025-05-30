// src/app/interfaces/usuario.interface.ts

export interface Usuario {
  id?: number;
  usuario: string;
  password?: string;
  rol: RolUsuario;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
}

export interface UsuarioCreateDTO {
  usuario: string;
  password: string;
  rol: RolUsuario;
  activo?: boolean;
}

export interface UsuarioUpdateDTO {
  usuario?: string;
  rol?: RolUsuario;
  activo?: boolean;
  // password no se incluye aquí, se maneja por separado
}

export interface ResetPasswordDTO {
  password: string;
}

export enum RolUsuario {
  ADMINISTRADOR = 'ADMINISTRADOR',
  CHOFER = 'CHOFER'
}

export interface EstadisticasUsuarios {
  totalUsuarios: number;
  usuariosActivos: number;
  usuariosInactivos: number;
  administradores: number;
  choferes: number;
}