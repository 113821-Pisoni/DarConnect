package com.darconnect.entities;

import com.darconnect.models.EstadoTraslado;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "traslados")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrasladoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_traslado")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_agenda", nullable = false)
    private AgendaEntity agenda;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private PacienteEntity paciente;

    @Column(name = "direccion_origen", nullable = false, length = 255)
    private String direccionOrigen;

    @Column(name = "direccion_destino", nullable = false, length = 255)
    private String direccionDestino;

    @Column(name = "hora_programada", nullable = false)
    private LocalTime horaProgramada;

    // Días de la semana: 1=Lunes, 2=Martes, ... 7=Domingo
    // Ejemplo: "1,3,5" para Lunes, Miércoles y Viernes
    @Column(name = "dias_semana", nullable = false, length = 20)
    private String diasSemana;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin; // null = indefinido

    @Column(name = "activo", columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean activo;

    @Column(name = "observaciones", length = 500)
    private String observaciones;

    // Estado actual del traslado para el día de hoy (calculado)
    @Transient
    private EstadoTraslado estadoActual;

    @OneToMany(mappedBy = "traslado", fetch = FetchType.LAZY)
    private List<HistoricoTrasladoEntity> historicos;

}
