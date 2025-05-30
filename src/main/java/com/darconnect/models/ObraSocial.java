package com.darconnect.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ObraSocial {
    private Long id;
    private String descripcion;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
}