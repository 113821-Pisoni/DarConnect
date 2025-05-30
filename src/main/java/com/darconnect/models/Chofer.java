package com.darconnect.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Chofer {
    private Long id;
    private Long idUsuario;
    private String nombre;
    private String apellido;
    private String dni;
    private String telefono;
    private String direccion;
    private LocalDate fechaVencimientoLicencia;
    private LocalDate fechaContratacion;
    private Boolean activo = true;
}