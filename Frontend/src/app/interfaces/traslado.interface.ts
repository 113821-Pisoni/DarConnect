// src/interfaces/traslado.interface.ts

export interface TrasladoDelDia {
  idTraslado: number;
  idPaciente: number;
  nombreCompletoPaciente: string;
  direccionOrigen: string;
  direccionDestino: string;
  horaProgramada: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  };
  estadoActual: EstadoTraslado;
  sillaRueda: boolean;
  telefonoPaciente: string;
  puedeIniciar: boolean;
  puedeFinalizar: boolean;
  nombreCompletoChofer?: string;
}

export interface TrasladoDTO {
  id: number;
  idAgenda: number;
  idPaciente: number;
  direccionOrigen: string;
  direccionDestino: string;
  horaProgramada: string; // LocalTime como string "HH:mm:ss"
  diasSemana: string;
  fechaInicio: string; // LocalDate como string "yyyy-MM-dd"
  fechaFin?: string;
  activo: boolean;
  observaciones?: string;
  estadoActual?: EstadoTraslado;
  nombreCompletoPaciente?: string;
  nombreCompletoChofer?: string;
  sillaRueda?: boolean;
  telefonoPaciente?: string;
}

export interface TrasladoCreateDTO {
  idAgenda: number;
  idPaciente: number;
  direccionOrigen: string;
  direccionDestino: string;
  horaProgramada: string; // "HH:mm:ss"
  diasSemana: string; // "1,3,5"
  fechaInicio: string; // "yyyy-MM-dd"
  fechaFin?: string;
  observaciones?: string;
}

export interface TrasladoUpdateDTO {
  idAgenda?: number;
  idPaciente?: number;
  direccionOrigen?: string;
  direccionDestino?: string;
  horaProgramada?: string;
  diasSemana?: string;
  fechaInicio?: string;
  fechaFin?: string;
  observaciones?: string;
  activo?: boolean;
}

export enum EstadoTraslado {
  PENDIENTE = 'PENDIENTE',
  INICIADO = 'INICIADO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO'
}

export interface EstadisticasTraslados {
  totalTraslados: number;
  trasladosActivos: number;
  trasladosInactivos: number;
  pendientes: number;
  iniciados: number;
  finalizados: number;
  cancelados: number;
}

// Helper para manejar días de la semana
export interface DiaSemana {
  id: number;
  nombre: string;
  seleccionado: boolean;
}