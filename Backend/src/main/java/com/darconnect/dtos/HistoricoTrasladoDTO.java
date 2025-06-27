package com.darconnect.dtos;

import com.darconnect.models.EstadoTraslado;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoricoTrasladoDTO {
    private Long idHistorico;
    private Long idTraslado;
    private LocalDate fechaTraslado;
    private EstadoTraslado estado;
    private LocalDateTime fechaHoraCambio;
    private Long idUsuario;
    private String motivoCancelacion;

    // Datos del traslado relacionado (via JOIN)
    private String nombrePaciente;
    private String direccionOrigen;
    private String direccionDestino;
    private LocalTime horaProgramada;
    private Boolean sillaRueda;
    private String nombreChofer;
}