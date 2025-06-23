package com.darconnect.repositories;

import com.darconnect.entities.HistoricoTrasladoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HistoricoTrasladoRepository extends JpaRepository<HistoricoTrasladoEntity, Long> {

    boolean existsByTrasladoIdAndFechaTraslado(Long trasladoId, LocalDate fechaTraslado);
    long countByFechaTraslado(LocalDate fecha);

    @Query(value = "SELECT * FROM historico_traslados h WHERE h.id_traslado = :trasladoId AND h.fecha_traslado = :fechaTraslado ORDER BY h.fecha_hora_cambio DESC LIMIT 1", nativeQuery = true)
    Optional<HistoricoTrasladoEntity> findUltimoRegistroDelDia(@Param("trasladoId") Long trasladoId, @Param("fechaTraslado") LocalDate fechaTraslado);

    // 📊 QUERIES PARA ESTADÍSTICAS DEL CHOFER

    // Contar traslados FINALIZADOS en un período
    @Query("""
    SELECT COUNT(h) FROM HistoricoTrasladoEntity h
    WHERE h.traslado.agenda.chofer.id = :choferId
    AND h.fechaTraslado BETWEEN :fechaInicio AND :fechaFin
    AND h.estado = com.darconnect.models.EstadoTraslado.FINALIZADO
    """)
    long countTrasladosFinalizados(@Param("choferId") Long choferId,
                                   @Param("fechaInicio") LocalDate fechaInicio,
                                   @Param("fechaFin") LocalDate fechaFin);

    // Contar traslados CANCELADOS en un período
    @Query("""
    SELECT COUNT(h) FROM HistoricoTrasladoEntity h
    WHERE h.traslado.agenda.chofer.id = :choferId
    AND h.fechaTraslado BETWEEN :fechaInicio AND :fechaFin
    AND h.estado = com.darconnect.models.EstadoTraslado.CANCELADO
    """)
    long countTrasladosCancelados(@Param("choferId") Long choferId,
                                  @Param("fechaInicio") LocalDate fechaInicio,
                                  @Param("fechaFin") LocalDate fechaFin);

    // Contar traslados FINALIZADOS con silla de ruedas
    @Query("""
    SELECT COUNT(h) FROM HistoricoTrasladoEntity h
    WHERE h.traslado.agenda.chofer.id = :choferId
    AND h.fechaTraslado BETWEEN :fechaInicio AND :fechaFin
    AND h.estado = com.darconnect.models.EstadoTraslado.FINALIZADO
    AND h.traslado.paciente.sillaRueda = true
    """)
    long countTrasladosConSilla(@Param("choferId") Long choferId,
                                @Param("fechaInicio") LocalDate fechaInicio,
                                @Param("fechaFin") LocalDate fechaFin);

    // Contar traslados FINALIZADOS sin silla de ruedas
    @Query("""
    SELECT COUNT(h) FROM HistoricoTrasladoEntity h
    WHERE h.traslado.agenda.chofer.id = :choferId
    AND h.fechaTraslado BETWEEN :fechaInicio AND :fechaFin
    AND h.estado = com.darconnect.models.EstadoTraslado.FINALIZADO
    AND h.traslado.paciente.sillaRueda = false
    """)
    long countTrasladosSinSilla(@Param("choferId") Long choferId,
                                @Param("fechaInicio") LocalDate fechaInicio,
                                @Param("fechaFin") LocalDate fechaFin);

    // Distribución por horas (PostgreSQL)
    @Query(value = """
    SELECT EXTRACT(HOUR FROM t.hora_programada)::integer as hora, COUNT(*)::integer as cantidad
    FROM historico_traslados h
    INNER JOIN traslados t ON h.id_traslado = t.id_traslado
    INNER JOIN agendas a ON t.id_agenda = a.id_agenda
    WHERE a.id_chofer = :choferId
    AND h.fecha_traslado BETWEEN :fechaInicio AND :fechaFin
    AND h.estado = 'FINALIZADO'
    GROUP BY EXTRACT(HOUR FROM t.hora_programada)
    ORDER BY EXTRACT(HOUR FROM t.hora_programada)
    """, nativeQuery = true)
    List<Object[]> getDistribucionHorasByChoferAndPeriodo(@Param("choferId") Long choferId,
                                                          @Param("fechaInicio") LocalDate fechaInicio,
                                                          @Param("fechaFin") LocalDate fechaFin);

    // 📊 QUERIES EXISTENTES (las que ya tenías)

    @Query("""
    SELECT COUNT(h) FROM HistoricoTrasladoEntity h
    WHERE h.traslado.agenda.chofer.id = :choferId
    AND h.fechaTraslado = :fecha
    AND h.estado = com.darconnect.models.EstadoTraslado.FINALIZADO
    """)
    long countTrasladosFinalizadosByChoferAndFecha(@Param("choferId") Long choferId, @Param("fecha") LocalDate fecha);

    @Query("""
    SELECT COUNT(h) FROM HistoricoTrasladoEntity h
    WHERE h.traslado.agenda.chofer.id = :choferId
    AND h.fechaTraslado BETWEEN :fechaInicio AND :fechaFin
    AND h.estado = com.darconnect.models.EstadoTraslado.FINALIZADO
    """)
    long countTrasladosFinalizadosByChoferAndPeriodo(@Param("choferId") Long choferId,
                                                     @Param("fechaInicio") LocalDate fechaInicio,
                                                     @Param("fechaFin") LocalDate fechaFin);

    @Query("""
    SELECT COUNT(h) FROM HistoricoTrasladoEntity h
    WHERE h.traslado.agenda.chofer.id = :choferId
    AND h.fechaTraslado BETWEEN :fechaInicio AND :fechaFin
    AND h.estado = com.darconnect.models.EstadoTraslado.FINALIZADO
    AND h.traslado.paciente.sillaRueda = :sillaRueda
    """)
    long countTrasladosFinalizadosBySillaRueda(@Param("choferId") Long choferId,
                                               @Param("fechaInicio") LocalDate fechaInicio,
                                               @Param("fechaFin") LocalDate fechaFin,
                                               @Param("sillaRueda") Boolean sillaRueda);

    // 📊 QUERY PRINCIPAL OPTIMIZADO PARA CONSULTA CON FILTROS Y PAGINACIÓN
    @Query(value = """
    SELECT h.id_historico, h.id_traslado, h.fecha_traslado, h.fecha_hora_cambio, h.estado, h.motivo_cancelacion,
           t.hora_programada, t.observaciones, t.activo as traslado_activo, t.dias_semana, t.fecha_inicio, t.fecha_fin,
           p.id_paciente as paciente_id, p.nombre as paciente_nombre, p.apellido as paciente_apellido, 
           p.dni as paciente_dni, p.telefono as paciente_telefono, p.direccion as paciente_direccion, 
           p.ciudad as paciente_ciudad, p.silla_rueda,
           c.id_chofer as chofer_id, c.nombre as chofer_nombre, c.apellido as chofer_apellido, 
           c.dni as chofer_dni, c.telefono as chofer_telefono, c.activo as chofer_activo,
           a.id_agenda as agenda_id, a.activo as agenda_activo
    FROM historico_traslados h
    INNER JOIN traslados t ON h.id_traslado = t.id_traslado
    INNER JOIN pacientes p ON t.id_paciente = p.id_paciente
    INNER JOIN agendas a ON t.id_agenda = a.id_agenda
    INNER JOIN choferes c ON a.id_chofer = c.id_chofer
    WHERE (:fechaInicio IS NULL OR h.fecha_traslado >= :fechaInicio)
    AND (:fechaFin IS NULL OR h.fecha_traslado <= :fechaFin)
    AND (:choferId IS NULL OR c.id_chofer = :choferId)
    AND (:pacienteId IS NULL OR p.id_paciente = :pacienteId)
    AND (:estado IS NULL OR h.estado = :estado)
    ORDER BY h.fecha_hora_cambio DESC
    LIMIT :limit OFFSET :offset
    """, nativeQuery = true)
    List<Object[]> findHistoricoConFiltros(
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin,
            @Param("choferId") Long choferId,
            @Param("pacienteId") Long pacienteId,
            @Param("estado") String estado,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    // QUERY PARA CONTAR TOTAL CON LOS MISMOS FILTROS
    @Query(value = """
    SELECT COUNT(*)
    FROM historico_traslados h
    INNER JOIN traslados t ON h.id_traslado = t.id_traslado
    INNER JOIN pacientes p ON t.id_paciente = p.id_paciente
    INNER JOIN agendas a ON t.id_agenda = a.id_agenda
    INNER JOIN choferes c ON a.id_chofer = c.id_chofer
    WHERE (:fechaInicio IS NULL OR h.fecha_traslado >= :fechaInicio)
    AND (:fechaFin IS NULL OR h.fecha_traslado <= :fechaFin)
    AND (:choferId IS NULL OR c.id_chofer = :choferId)
    AND (:pacienteId IS NULL OR p.id_paciente = :pacienteId)
    AND (:estado IS NULL OR h.estado = :estado)
    """, nativeQuery = true)
    long countHistoricoConFiltros(
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin,
            @Param("choferId") Long choferId,
            @Param("pacienteId") Long pacienteId,
            @Param("estado") String estado
    );

    // QUERY SIMPLE PARA ESTADÍSTICAS RÁPIDAS
    @Query(value = """
    SELECT h.estado, COUNT(*) as cantidad
    FROM historico_traslados h
    WHERE (:fechaInicio IS NULL OR h.fecha_traslado >= :fechaInicio)
    AND (:fechaFin IS NULL OR h.fecha_traslado <= :fechaFin)
    GROUP BY h.estado
    """, nativeQuery = true)
    List<Object[]> getEstadisticasEstados(
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin
    );
}