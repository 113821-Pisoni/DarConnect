package com.darconnect.entities;

import com.darconnect.models.EstadoTraslado;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "historico_traslados")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoricoTrasladoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historico")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_traslado", nullable = false)
    private TrasladoEntity traslado;

    @Column(name = "fecha_traslado", nullable = false)
    private LocalDate fechaTraslado;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoTraslado estado;

    @Column(name = "fecha_hora_cambio", nullable = false)
    private LocalDateTime fechaHoraCambio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private UsuarioEntity usuario; // quien realizó el cambio

    @Column(name = "motivo_cancelacion", length = 500)
    private String motivoCancelacion; // solo si estado = CANCELADO
}