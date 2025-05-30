package com.darconnect.dtos;

import com.darconnect.entities.TrasladoEntity;
import com.darconnect.models.EstadoTraslado;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TrasladoConEstadoDTO {
    private TrasladoEntity traslado;
    private EstadoTraslado estadoActual;

    public TrasladoConEstadoDTO(TrasladoEntity traslado, EstadoTraslado estado) {
        this.traslado = traslado;
        this.estadoActual = estado != null ? estado : EstadoTraslado.PENDIENTE;
    }
}