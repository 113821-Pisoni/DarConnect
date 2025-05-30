package com.darconnect.repositories;

import com.darconnect.entities.ChoferEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChoferRepository extends JpaRepository<ChoferEntity, Long> {
    Optional<ChoferEntity> findByUsuarioId(Integer usuarioId);

    @Query("SELECT c FROM ChoferEntity c WHERE c.activo = true")
    List<ChoferEntity> findAllActivos();

    @Query("SELECT c FROM ChoferEntity c WHERE c.usuario.id = :usuarioId AND c.activo = true")
    Optional<ChoferEntity> findByUsuarioIdAndActivo(@Param("usuarioId") Integer usuarioId);

    @Query("SELECT c.usuario.id FROM ChoferEntity c WHERE c.activo = true")
    List<Integer> findAllUsuarioIds();
}
