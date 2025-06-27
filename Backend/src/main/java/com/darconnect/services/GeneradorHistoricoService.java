package com.darconnect.services;

import java.time.LocalDate;

public interface GeneradorHistoricoService {

    /**
     * Ejecutar generación automática de históricos para el día actual.
     * Usado por el scheduler.
     */
    void generarHistoricosDiarios();

    /**
     * Genera los históricos de traslados para una fecha específica.
     * Útil para pruebas o ejecuciones manuales.
     *
     * @param fecha Fecha para la cual se deben generar los históricos.
     */
    void generarHistoricosParaFecha(LocalDate fecha);

    /**
     * Verifica si ya se generaron los históricos para el día actual.
     *
     * @return true si ya fueron generados, false en caso contrario.
     */
    boolean historicosGeneradosParaHoy();
}
