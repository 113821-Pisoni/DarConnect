package com.darconnect.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrasladoPorDiaDTO {
    private String dia;     // "Lun", "Mar", etc. o "Sem 1", "Sem 2" para mes
    private Integer cantidad;
    private Integer total;
    private Integer finalizados;
    private Integer cancelados;
    private Integer pendientes;

    public TrasladoPorDiaDTO(String dia, Integer cantidad) {
        this.dia = dia;
        this.cantidad = cantidad;
        this.total = cantidad;
        this.finalizados = cantidad;
        this.cancelados = 0;
        this.pendientes = 0;
    }
}