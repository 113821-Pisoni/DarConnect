// src/app/interfaces/historico-traslado.interface.ts
import { EstadoTraslado } from './traslado.interface';

export interface HistoricoFiltrosDTO {
  fechaInicio?: string;
  fechaFin?: string;
  choferId?: number;
  pacienteId?: number;
  estado?: EstadoTraslado;
  page?: number;
  size?: number;
}