// src/interfaces/obraSocial.interface.ts
export interface ObraSocial {
  id: number;
  descripcion: string;
  activo: boolean;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface ObraSocialCreateDTO {
  descripcion: string;
  activo: boolean;
}

export interface ObraSocialUpdateDTO {
  descripcion?: string;
  activo?: boolean;
}

export interface EstadisticasObrasSociales {
  totalObrasSociales: number;
  obrasSocialesActivas: number;
  obrasSocialesInactivas: number;
}