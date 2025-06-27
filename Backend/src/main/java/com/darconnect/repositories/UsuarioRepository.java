package com.darconnect.repositories;

import com.darconnect.entities.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<UsuarioEntity, Long> {
    Optional<UsuarioEntity> findByUsuario(String usuario);
    @Query("SELECT u FROM UsuarioEntity u WHERE u.activo = true")
    List<UsuarioEntity> findAllActivos();

    @Query("SELECT u FROM UsuarioEntity u WHERE u.usuario = :usuario AND u.activo = true")
    Optional<UsuarioEntity> findByUsuarioAndActivo(@Param("usuario") String usuario);

    @Query("SELECT u FROM UsuarioEntity u WHERE u.rol = :rol AND u.activo = :activo")
    List<UsuarioEntity> findByRolAndActivo(@Param("rol") UsuarioEntity.Rol rol, @Param("activo") Boolean activo);
}
