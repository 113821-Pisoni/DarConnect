// src/interfaces/traslado.interface.ts

export interface TrasladoDelDia {
  idTraslado: number;
  idPaciente: number;
  idChofer?: number; // Agregado para poder identificar al chofer
  nombreCompletoPaciente: string;
  nombreCompletoChofer?: string;
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
  telefonoChofer?: string; // Agregado para poder contactar al chofer
  puedeIniciar: boolean;
  puedeFinalizar: boolean;
  fechaProgramada?: string; // Agregado para filtros por fecha "yyyy-MM-dd"
  observaciones?: string; // Agregado por si hay observaciones

  // Propiedades temporales para Google Maps (no se persisten)
  tiempoActual?: string;
  calculando?: boolean;
  ultimaActualizacion?: string;
}

export interface TrasladoDTO {
  id: number;
  idAgenda: number;
  idPaciente: number;
  idChofer?: number; // Agregado para consistencia
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
  telefonoChofer?: string; // Agregado
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
  id?: number; // IMPORTANTE: incluir ID para el modal
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

// Interfaz específica para la respuesta del endpoint de traslados del día
export interface TrasladoDelDiaResponse {
  traslados: TrasladoDelDia[];
  fecha: string;
  totalTraslados: number;
  estadisticas: {
    pendientes: number;
    iniciados: number;
    finalizados: number;
    cancelados: number;
  };
}

// Interfaz para filtros de búsqueda
export interface FiltrosTraslado {
  fecha?: string;
  estado?: EstadoTraslado;
  idChofer?: number;
  idPaciente?: number;
  sillaRueda?: boolean;
}

// Helper para estados de traslado con información adicional
export interface EstadoTrasladoInfo {
  estado: EstadoTraslado;
  label: string;
  color: string;
  icon: string;
  descripcion: string;
}

// Constantes para los estados
export const ESTADOS_TRASLADO: Record<EstadoTraslado, EstadoTrasladoInfo> = {
  [EstadoTraslado.PENDIENTE]: {
    estado: EstadoTraslado.PENDIENTE,
    label: 'Pendiente',
    color: 'warning',
    icon: 'clock',
    descripcion: 'Traslado programado pero no iniciado'
  },
  [EstadoTraslado.INICIADO]: {
    estado: EstadoTraslado.INICIADO,
    label: 'En Curso',
    color: 'success',
    icon: 'play-circle',
    descripcion: 'Traslado en progreso'
  },
  [EstadoTraslado.FINALIZADO]: {
    estado: EstadoTraslado.FINALIZADO,
    label: 'Finalizado',
    color: 'primary',
    icon: 'check-circle',
    descripcion: 'Traslado completado exitosamente'
  },
  [EstadoTraslado.CANCELADO]: {
    estado: EstadoTraslado.CANCELADO,
    label: 'Cancelado',
    color: 'danger',
    icon: 'x-circle',
    descripcion: 'Traslado cancelado'
  }
};