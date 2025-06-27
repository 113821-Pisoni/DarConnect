package com.darconnect.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class GoogleMapsResponse {
    private String duracion;
    private String duracionTexto;
    private String distancia;
    private String distanciaTexto;
    private String trafico;
    private LocalDateTime ultimaActualizacion;
    private boolean success;
    private String error;

    // Constructor exitoso
    public GoogleMapsResponse(String duracion, String duracionTexto, String distancia, String distanciaTexto, String trafico) {
        this.ultimaActualizacion = LocalDateTime.now();
        this.duracion = duracion;
        this.duracionTexto = duracionTexto;
        this.distancia = distancia;
        this.distanciaTexto = distanciaTexto;
        this.trafico = trafico;
        this.success = true;
    }

    // Constructor error
    public GoogleMapsResponse(String error) {
        this.ultimaActualizacion = LocalDateTime.now();
        this.error = error;
        this.success = false;
    }
}