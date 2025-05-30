package com.darconnect.repositories;

import com.darconnect.entities.ObraSocialEntity;
import com.darconnect.entities.PacienteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ObraSocialRepository extends JpaRepository<ObraSocialEntity, Long> {

    @Query("SELECT p FROM ObraSocialEntity p WHERE p.id = :id AND p.activo = true")
    Optional<ObraSocialEntity> findByIdAndActivo(@Param("id") Long id);

    @Query("SELECT p FROM ObraSocialEntity p WHERE p.activo = true")
    List<ObraSocialEntity> findAllActivos();
}
