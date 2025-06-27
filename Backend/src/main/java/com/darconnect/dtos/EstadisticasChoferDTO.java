package com.darconnect.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasChoferDTO {
    private Integer trasladosHoy;        // Total de traslados en el período
    private Integer trasladosSemana;     // Traslados finalizados
    private Integer trasladosMes;        // Traslados cancelados
    private Integer conSillaRuedas;
    private Integer sinSillaRuedas;

    // Agregar datos para el gráfico (en lugar de distribucionHoras)
    private List<TrasladoPorDiaDTO> trasladosPorDia;

    // Métodos de conveniencia para el frontend
    public Double getPorcentajeExito() {
        if (trasladosHoy == null || trasladosHoy == 0) return 0.0;
        return ((double) trasladosSemana / trasladosHoy) * 100;
    }

    public Double getPorcentajeCancelacion() {
        if (trasladosHoy == null || trasladosHoy == 0) return 0.0;
        return ((double) trasladosMes / trasladosHoy) * 100;
    }
}