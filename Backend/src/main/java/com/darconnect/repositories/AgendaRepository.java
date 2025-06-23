package com.darconnect.repositories;

import com.darconnect.entities.AgendaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgendaRepository extends JpaRepository<AgendaEntity, Long> {

    @Query("SELECT a FROM AgendaEntity a WHERE a.activo = true")
    List<AgendaEntity> findAllActivas();

    @Query("SELECT a FROM AgendaEntity a WHERE a.chofer.id = :choferId AND a.activo = true")
    Optional<AgendaEntity> findByChoferIdAndActivo(@Param("choferId") Long choferId);

    @Query("SELECT a FROM AgendaEntity a JOIN FETCH@ a.chofer WHERE a.activo = true")
    List<AgendaEntity> findAllActivasWithChofer();

    @Query("SELECT a FROM AgendaEntity a JOIN FETCH a.chofer WHERE a.id = :id AND a.activo = true")
    Optional<AgendaEntity> findByIdWithChofer(@Param("id") Long id);
}