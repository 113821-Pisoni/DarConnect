package com.darconnect.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Agenda {
    private Long id;
    private Long idChofer;
    private Boolean activo = true;
    private LocalDateTime fechaCreacion;

    private String nombreChofer;
    private String apellidoChofer;
}