package com.darconnect.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ObraSocialDTO {
    private Long id;
    private String descripcion;
    private boolean activo;
}
