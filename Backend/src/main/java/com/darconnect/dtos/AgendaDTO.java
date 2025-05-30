package com.darconnect.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgendaDTO {
    private Long id;

    @NotNull(message = "El ID del chofer es obligatorio")
    private Long idChofer;

    private Boolean activo = true;
    private LocalDateTime fechaCreacion;

    // Para mostrar información del chofer en respuestas
    private String nombreChofer;
    private String apellidoChofer;
    private String dniChofer;
}