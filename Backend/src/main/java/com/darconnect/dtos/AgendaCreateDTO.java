package com.darconnect.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgendaCreateDTO {
    @NotNull(message = "El ID del chofer es obligatorio")
    private Long idChofer;
}