package com.darconnect.dtos;

import com.darconnect.models.EstadoTraslado;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Data
@NoArgsConstructor
public class TrasladoDelDiaDTO {
    private Long idTraslado;
    private Long idPaciente;
    private String nombreCompletoPaciente;
    private String direccionOrigen;
    private String direccionDestino;
    private LocalTime horaProgramada;
    private EstadoTraslado estadoActual;
    private Boolean sillaRueda;
    private String telefonoPaciente;
    private Boolean puedeIniciar;
    private Boolean puedeFinalizar;
    private String nombreCompletoChofer;

    // Constructor original para chofer
    public TrasladoDelDiaDTO(Long idTraslado, Long idPaciente, String nombreCompletoPaciente,
                             String direccionOrigen, String direccionDestino, LocalTime horaProgramada,
                             EstadoTraslado estado, Boolean sillaRueda, String telefonoPaciente,
                             Boolean puedeIniciar, Boolean puedeFinalizar) {
        this.idTraslado = idTraslado;
        this.idPaciente = idPaciente;
        this.nombreCompletoPaciente = nombreCompletoPaciente;
        this.direccionOrigen = direccionOrigen;
        this.direccionDestino = direccionDestino;
        this.horaProgramada = horaProgramada;
        this.estadoActual = estado != null ? estado : EstadoTraslado.PENDIENTE;
        this.sillaRueda = sillaRueda;
        this.telefonoPaciente = telefonoPaciente;
        this.puedeIniciar = puedeIniciar;
        this.puedeFinalizar = puedeFinalizar;
    }

    public TrasladoDelDiaDTO(Long idTraslado, Long idPaciente, String nombreCompletoPaciente,
                             String direccionOrigen, String direccionDestino, LocalTime horaProgramada,
                             EstadoTraslado estado, Boolean sillaRueda, String telefonoPaciente) {
        this.idTraslado = idTraslado;
        this.idPaciente = idPaciente;
        this.nombreCompletoPaciente = nombreCompletoPaciente;
        this.direccionOrigen = direccionOrigen;
        this.direccionDestino = direccionDestino;
        this.horaProgramada = horaProgramada;
        this.estadoActual = estado != null ? estado : EstadoTraslado.PENDIENTE;
        this.sillaRueda = sillaRueda;
        this.telefonoPaciente = telefonoPaciente;

        this.puedeIniciar = this.estadoActual == EstadoTraslado.PENDIENTE;
        this.puedeFinalizar = this.estadoActual == EstadoTraslado.INICIADO;
    }

    // Constructor nuevo para admin con nombre del chofer
    public TrasladoDelDiaDTO(Long idTraslado, Long idPaciente, String nombreCompletoPaciente,
                             String direccionOrigen, String direccionDestino, LocalTime horaProgramada,
                             EstadoTraslado estado, Boolean sillaRueda, String telefonoPaciente,
                             Boolean puedeIniciar, Boolean puedeFinalizar, String nombreCompletoChofer) {
        this.idTraslado = idTraslado;
        this.idPaciente = idPaciente;
        this.nombreCompletoPaciente = nombreCompletoPaciente;
        this.direccionOrigen = direccionOrigen;
        this.direccionDestino = direccionDestino;
        this.horaProgramada = horaProgramada;
        this.estadoActual = estado != null ? estado : EstadoTraslado.PENDIENTE;
        this.sillaRueda = sillaRueda;
        this.telefonoPaciente = telefonoPaciente;
        this.puedeIniciar = puedeIniciar;
        this.puedeFinalizar = puedeFinalizar;
        this.nombreCompletoChofer = nombreCompletoChofer;
    }
}