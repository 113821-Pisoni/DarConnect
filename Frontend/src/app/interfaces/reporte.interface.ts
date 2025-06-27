// interfaces/reporte.interface.ts - VERSION MEJORADA

export interface TrasladosPorDia {
  dia: string;
  traslados: number;
}

export interface TrasladosPorHora {
  hora: string;
  cantidad: number;
}

export interface TipoTraslado {
  name: string;
  value: number;
  color: string;
}

export interface DestinoFrecuente {
  destino: string;
  viajes: number;
}

export interface EstadisticasReporte {
  totalTraslados: number;
  trasladosFinalizados: number;
  trasladosCancelados: number;
  trasladosSillaRuedas: number;
  tiempoPromedio: string;
  puntualidad: number;
}

export interface EstadisticasChoferResponse {
  trasladosHoy: number;
  trasladosFinalizados: number;
  trasladosCancelados: number;
  conSillaRuedas: number;
  sinSillaRuedas: number;
}