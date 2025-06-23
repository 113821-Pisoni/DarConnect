package com.darconnect.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "agendas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgendaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_agenda")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_chofer", nullable = false, unique = true)
    private ChoferEntity chofer;

    @Column(name = "activo", columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean activo;

    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @OneToMany(mappedBy = "agenda", fetch = FetchType.LAZY)
    private List<TrasladoEntity> traslados;


}