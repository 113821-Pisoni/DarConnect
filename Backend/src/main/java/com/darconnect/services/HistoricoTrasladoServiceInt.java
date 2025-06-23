package com.darconnect.services;

import com.darconnect.models.EstadoTraslado;
import java.time.LocalDate;
import java.util.Map;

public interface HistoricoTrasladoServiceInt {

    Map<String, Object> getHistoricoConFiltros(
            LocalDate fechaInicio,
            LocalDate fechaFin,
            Long choferId,
            Long pacienteId,
            EstadoTraslado estado,
            int page,
            int size
    );

    Map<String, Object> getEstadisticasHistorico(LocalDate fechaInicio, LocalDate fechaFin);
}