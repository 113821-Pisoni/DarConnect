package com.darconnect.repositories;

import com.darconnect.dtos.TrasladoDelDiaDTO;
import com.darconnect.entities.TrasladoEntity;
import com.darconnect.models.EstadoTraslado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface TrasladoRepository extends JpaRepository<TrasladoEntity, Long> {

    @Query("""
    SELECT new com.darconnect.dtos.TrasladoDelDiaDTO(
        t.id, 
        p.id, 
        CONCAT(p.nombre, ' ', p.apellido),
        t.direccionOrigen,
        t.direccionDestino,
        t.horaProgramada,
        COALESCE(
            (SELECT h.estado FROM HistoricoTrasladoEntity h 
             WHERE h.traslado.id = t.id 
             AND h.fechaTraslado = :fecha 
             ORDER BY h.fechaHoraCambio DESC 
             LIMIT 1), 
            com.darconnect.models.EstadoTraslado.PENDIENTE
        ),
        p.sillaRueda,
        p.telefono,
        true,
        true
    )
    FROM TrasladoEntity t
    JOIN t.paciente p
    WHERE t.agenda.chofer.id = :choferId
    AND t.activo = true
    AND t.fechaInicio <= :fecha
    AND (t.fechaFin IS NULL OR t.fechaFin >= :fecha)
    AND t.diasSemana LIKE CONCAT('%', :diaSemana, '%')
    ORDER BY t.horaProgramada
""")
    List<TrasladoDelDiaDTO> findTrasladosDelDiaParaChofer(
            @Param("choferId") Integer choferId,
            @Param("fecha") LocalDate fecha,
            @Param("diaSemana") String diaSemana
    );

    @Query("""
        SELECT t
        FROM TrasladoEntity t
        WHERE t.activo = true
        AND t.fechaInicio <= :fecha
        AND (t.fechaFin IS NULL OR t.fechaFin >= :fecha)
        AND t.diasSemana LIKE CONCAT('%', :diaSemana, '%')
    """)
    List<TrasladoEntity> findTrasladosDelDia(
            @Param("fecha") LocalDate fecha,
            @Param("diaSemana") String diaSemana
    );

    // Query separada para obtener el último estado de un traslado
    @Query("""
        SELECT h.estado
        FROM HistoricoTrasladoEntity h
        WHERE h.traslado.id = :trasladoId
        AND h.fechaTraslado = :fecha
        ORDER BY h.fechaHoraCambio DESC
        LIMIT 1
    """)
    Optional<EstadoTraslado> findUltimoEstadoDelDia(
            @Param("trasladoId") Long trasladoId,
            @Param("fecha") LocalDate fecha
    );

    // Para obtener todos los traslados activos con relaciones
    @Query("SELECT t FROM TrasladoEntity t JOIN FETCH t.agenda a JOIN FETCH a.chofer JOIN FETCH t.paciente WHERE t.activo = true")
    List<TrasladoEntity> findAllActivosWithRelations();

    // Para obtener un traslado por ID con relaciones
    @Query("SELECT t FROM TrasladoEntity t JOIN FETCH t.agenda a JOIN FETCH a.chofer JOIN FETCH t.paciente WHERE t.id = :id AND t.activo = true")
    Optional<TrasladoEntity> findByIdWithRelations(@Param("id") Long id);

    // Para obtener traslados por agenda
    @Query("SELECT t FROM TrasladoEntity t WHERE t.agenda.id = :agendaId AND t.activo = true ORDER BY t.horaProgramada")
    List<TrasladoEntity> findByAgendaIdAndActivo(@Param("agendaId") Long agendaId);

    // Para obtener traslados por paciente
    @Query("SELECT t FROM TrasladoEntity t WHERE t.paciente.id = :pacienteId AND t.activo = true ORDER BY t.horaProgramada")
    List<TrasladoEntity> findByPacienteIdAndActivo(@Param("pacienteId") Long pacienteId);

    // Para validar conflictos de horario (traslados superpuestos)
    @Query("""
    SELECT COUNT(t) > 0 FROM TrasladoEntity t 
    WHERE t.agenda.id = :agendaId 
    AND t.activo = true 
    AND (:trasladoId IS NULL OR t.id != :trasladoId)
    AND t.horaProgramada = :hora
    AND t.fechaInicio <= :fechaFin 
    AND (t.fechaFin IS NULL OR t.fechaFin >= :fechaInicio)
    AND (
        t.diasSemana LIKE CONCAT('%', :diaSemana, '%')
    )
    """)
    boolean existsConflictingTraslado(@Param("agendaId") Long agendaId,
                                      @Param("trasladoId") Long trasladoId,
                                      @Param("hora") java.time.LocalTime hora,
                                      @Param("fechaInicio") LocalDate fechaInicio,
                                      @Param("fechaFin") LocalDate fechaFin,
                                      @Param("diaSemana") String diaSemana);

    @Query("SELECT t FROM TrasladoEntity t WHERE " +
            "t.activo = true AND " +
            "t.fechaInicio <= :fecha AND " +
            "(t.fechaFin IS NULL OR t.fechaFin >= :fecha) AND " +
            "t.diasSemana LIKE CONCAT('%', :diaSemana, '%')")
    List<TrasladoEntity> findTrasladosParaFecha(@Param("fecha") LocalDate fecha,
                                                @Param("diaSemana") String diaSemana);

    @Query("SELECT COUNT(t) FROM TrasladoEntity t WHERE " +
            "t.activo = true AND " +
            "t.fechaInicio <= :fecha AND " +
            "(t.fechaFin IS NULL OR t.fechaFin >= :fecha) AND " +
            "t.diasSemana LIKE CONCAT('%', :diaSemana, '%')")
    long countTrasladosParaFecha(@Param("fecha") LocalDate fecha,
                                 @Param("diaSemana") String diaSemana);

    List<TrasladoEntity> findByAgenda_Chofer_IdAndActivoTrue(Long choferId);

    @Query("""
        SELECT new com.darconnect.dtos.TrasladoDelDiaDTO(
            t.id, 
            p.id, 
            CONCAT(p.nombre, ' ', p.apellido),
            t.direccionOrigen,
            t.direccionDestino,
            t.horaProgramada,
            COALESCE(
                (SELECT h.estado FROM HistoricoTrasladoEntity h 
                 WHERE h.traslado.id = t.id 
                 AND h.fechaTraslado = :fecha 
                 ORDER BY h.fechaHoraCambio DESC 
                 LIMIT 1), 
                com.darconnect.models.EstadoTraslado.PENDIENTE
            ),
            p.sillaRueda,
            p.telefono,
            true,
            true,
            CONCAT(c.nombre, ' ', c.apellido)
        )
        FROM TrasladoEntity t
        JOIN t.paciente p
        JOIN t.agenda a
        JOIN a.chofer c
        WHERE t.activo = true
        AND t.fechaInicio <= :fecha
        AND (t.fechaFin IS NULL OR t.fechaFin >= :fecha)
        AND t.diasSemana LIKE CONCAT('%', :diaSemana, '%')
        ORDER BY t.horaProgramada
    """)
        List<TrasladoDelDiaDTO> findTrasladosDelDiaAdmin(
                @Param("fecha") LocalDate fecha,
                @Param("diaSemana") String diaSemana
        );

    @Query("SELECT COUNT(t) > 0 FROM TrasladoEntity t WHERE t.paciente.id = :pacienteId AND t.activo = true")
    boolean existsByPacienteIdAndActivoTrue(@Param("pacienteId") Long pacienteId);


    @Query("SELECT t FROM TrasladoEntity t WHERE " +
            "t.paciente.id = :pacienteId AND " +
            "(:trasladoId IS NULL OR t.id != :trasladoId) AND " +
            "t.activo = true AND " +
            "t.horaProgramada = :horaProgramada")
    List<TrasladoEntity> findPotentialConflictsForPaciente(@Param("pacienteId") Long pacienteId,
                                                           @Param("trasladoId") Long trasladoId,
                                                           @Param("horaProgramada") LocalTime horaProgramada);

    // Para obtener TODOS los traslados (activos e inactivos) con relaciones
    @Query("SELECT t FROM TrasladoEntity t JOIN FETCH t.agenda a JOIN FETCH a.chofer JOIN FETCH t.paciente")
    List<TrasladoEntity> findAllWithRelations();
    
    @Query("SELECT t FROM TrasladoEntity t JOIN FETCH t.agenda a JOIN FETCH a.chofer JOIN FETCH t.paciente WHERE t.id = :id")
    Optional<TrasladoEntity> findByIdWithRelationsAll(@Param("id") Long id);
}