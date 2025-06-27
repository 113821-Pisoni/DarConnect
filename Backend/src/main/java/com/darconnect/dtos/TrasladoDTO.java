package com.darconnect.dtos;

import com.darconnect.models.EstadoTraslado;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrasladoDTO {
    private Long id;

    @NotNull(message = "El ID de la agenda es obligatorio")
    private Long idAgenda;

    @NotNull(message = "El ID del paciente es obligatorio")
    private Long idPaciente;

    @NotBlank(message = "La dirección de origen es obligatoria")
    private String direccionOrigen;

    @NotBlank(message = "La dirección de destino es obligatoria")
    private String direccionDestino;

    @NotNull(message = "La hora programada es obligatoria")
    private LocalTime horaProgramada;

    @NotBlank(message = "Los días de la semana son obligatorios")
    @Pattern(regexp = "^[1-7](,[1-7])*$", message = "Los días deben estar en formato: 1,2,3 (1=Lunes, 7=Domingo)")
    private String diasSemana;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    private LocalDate fechaFin;
    private Boolean activo = true;
    private String observaciones;

    // Campos de solo lectura para respuestas
    private EstadoTraslado estadoActual;
    private String nombreCompletoPaciente;
    private String nombreCompletoChofer;
    private Boolean sillaRueda;
    private String telefonoPaciente;
}