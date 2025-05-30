// src/interfaces/paciente.interface.ts
export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  idObraSocial?: number | null;
  sillaRueda: boolean;
  activo: boolean;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface PacienteCreateDTO {
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  idObraSocial?: number | null;
  sillaRueda: boolean;
  activo: boolean;
}

export interface PacienteUpdateDTO {
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  idObraSocial?: number | null;
  sillaRueda?: boolean;
  activo?: boolean;
}

export interface EstadisticasPacientes {
  totalPacientes: number;
  pacientesActivos: number;
  pacientesInactivos: number;
  conSillaRuedas: number;
  conObraSocial: number;
}