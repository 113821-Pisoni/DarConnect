// src/interfaces/agenda.interface.ts
import { TrasladoDTO } from './traslado.interface';

export interface Agenda {
  id: number;
  idChofer: number;
  activo: boolean;
  fechaCreacion?: Date;
  nombreChofer: string;
  apellidoChofer: string;
  dniChofer?: string;
}

export interface AgendaCreateDTO {
  idChofer: number;
}

export interface EstadisticasAgendas {
  totalAgendas: number;
  agendasActivas: number;
  agendasInactivas: number;
}

export interface AgendaSemanalResponse {
  inicioSemana: string; // formato: "2025-05-26"
  finSemana: string;    // formato: "2025-06-01"
  traslados: TrasladoDTO[];
}

export interface TrasladoAgenda extends TrasladoDTO {
  // Helper para el frontend
  diasSemanaArray?: number[]; // [1, 3, 5] parseado desde "1,3,5"
}