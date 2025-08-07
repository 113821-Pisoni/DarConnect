package com.darconnect.repositories;

import com.darconnect.entities.PacienteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PacienteRepository extends JpaRepository<PacienteEntity, Long> {
    @Query("SELECT p FROM PacienteEntity p WHERE p.activo = true")
    List<PacienteEntity> findAllActivos();

    @Query("SELECT p FROM PacienteEntity p WHERE p.id = :id AND p.activo = true")
    Optional<PacienteEntity> findByIdAndActivo(@Param("id") Long id);

    @Query("SELECT COUNT(p) > 0 FROM PacienteEntity p WHERE p.idObraSocial = :obraSocialId AND p.activo = true")
    boolean existsByIdObraSocialAndActivoTrue(@Param("obraSocialId") Long obraSocialId);



























































































































}
