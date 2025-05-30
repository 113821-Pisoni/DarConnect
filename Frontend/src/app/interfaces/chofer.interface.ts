// src/app/interfaces/chofer.interface.ts

export interface ChoferData {
  id: number;
  idUsuario: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  direccion?: string;
  fechaVencimientoLicencia: string;
  fechaContratacion?: string;
  activo?: boolean; 
  
  // Campos adicionales para mostrar en la lista
  usuarioNombre?: string;
  nombreCompleto?: string;
}

export interface ChoferCreateDTO {
  idUsuario: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  direccion?: string;
  fechaVencimientoLicencia: string;
  fechaContratacion?: string;
}

export interface ChoferUpdateDTO {
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  direccion?: string;
  fechaVencimientoLicencia?: string;
  fechaContratacion?: string;
  activo?: boolean;
}

export interface EstadisticasChoferes {
  totalChoferes: number;
  choferesActivos: number;
  choferesInactivos: number;
  licenciasVencidas: number;
  licenciasPorVencer: number;
}

export interface UsuarioDisponible {
  id: number;
  usuario: string;
  rol: string;
}