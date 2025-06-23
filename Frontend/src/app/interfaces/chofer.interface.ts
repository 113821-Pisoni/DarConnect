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
  id?: number;
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

// src/app/interfaces/estadisticas.interface.ts
export interface EstadisticasChoferResponse {
  trasladosHoy: number;        // Total en el período
  trasladosSemana: number;     // Finalizados
  trasladosMes: number;        // Cancelados
  conSillaRuedas: number;
  sinSillaRuedas: number;
  trasladosPorDia: TrasladoPorDia[];
  porcentajeExito: number;
  porcentajeCancelacion: number;
}

export interface TrasladoPorDia {
  dia: string;
  cantidad: number;
}

export interface MetricaCard {
  titulo: string;
  valor: number | string;
  icono: string;
  color: string;
  sufijo?: string;
}