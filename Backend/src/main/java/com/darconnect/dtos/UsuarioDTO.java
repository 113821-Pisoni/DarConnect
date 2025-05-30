package com.darconnect.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {

    private Long id;

    @NotBlank(message = "El usuario es obligatorio")
    @Size(max = 255, message = "El usuario no puede exceder 255 caracteres")
    private String usuario;

    @Size(min = 8, max = 255, message = "La contraseña debe tener entre 8 y 255 caracteres")
    private String password;

    @NotNull(message = "El rol es obligatorio")
    private RolDTO rol;

    private Boolean activo;

    private String fechaCreacion;
    private String fechaModificacion;

    public enum RolDTO {
        ADMINISTRADOR,
        CHOFER
    }
}