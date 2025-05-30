package com.darconnect.models;

import com.darconnect.models.EstadoTraslado;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Traslado {
    private Long id;
    private Long idAgenda;
    private Long idPaciente;
    private String direccionOrigen;
    private String direccionDestino;
    private LocalTime horaProgramada;
    private String diasSemana; // "1,3,5"
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Boolean activo = true;
    private String observaciones;

    private EstadoTraslado estadoActual;
    private String nombreCompletoPaciente;
    private String nombreCompletoChofer;
    private Boolean sillaRueda;
    private String telefonoPaciente;
}