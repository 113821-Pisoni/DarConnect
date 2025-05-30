package com.darconnect.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Paciente {
    private Long id;
    private String nombre;
    private String apellido;
    private String dni;
    private String telefono;
    private String direccion;
    private String ciudad;
    private String email;
    private Integer idObraSocial;
    private Boolean sillaRueda;
    private Boolean activo = true;
}