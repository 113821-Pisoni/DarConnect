package com.darconnect.repositories;

import com.darconnect.entities.HistoricoTrasladoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface HistoricoTrasladoRepository extends JpaRepository<HistoricoTrasladoEntity, Long> {

    // ✅ MÉTODOS ORIGINALES - NO TOCAR
    boolean existsByTrasladoIdAndFechaTraslado(Long trasladoId, LocalDate fechaTraslado);
    long countByFechaTraslado(LocalDate fecha);

    // ✅ MÉTODO NUEVO - Para buscar el último registro del día (SQL NATIVO)
    @Query(value = "SELECT * FROM historico_traslados h WHERE h.id_traslado = :trasladoId AND h.fecha_traslado = :fechaTraslado ORDER BY h.fecha_hora_cambio DESC LIMIT 1", nativeQuery = true)
    Optional<HistoricoTrasladoEntity> findUltimoRegistroDelDia(@Param("trasladoId") Long trasladoId, @Param("fechaTraslado") LocalDate fechaTraslado);

}