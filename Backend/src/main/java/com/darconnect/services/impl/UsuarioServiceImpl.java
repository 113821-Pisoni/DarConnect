package com.darconnect.services.impl;

import com.darconnect.entities.UsuarioEntity;
import com.darconnect.models.Usuario;
import com.darconnect.repositories.UsuarioRepository;
import com.darconnect.services.UsuarioService;
import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    @Autowired
    UsuarioRepository usuarioRepository;

    @Autowired
    ModelMapper modelMapper;

    @Override
    public Usuario getUsuario(Long id) {
        Optional<UsuarioEntity> usuarioEntityOptional = usuarioRepository.findById(id); // Convertir Long a Integer
        if (usuarioEntityOptional.isEmpty() || !usuarioEntityOptional.get().getActivo()) {
            throw new EntityNotFoundException("Usuario no encontrado con id: " + id);
        }
        return modelMapper.map(usuarioEntityOptional.get(), Usuario.class);
    }

    @Override
    public List<Usuario> getUsuariosList() {
        List<UsuarioEntity> usuarioEntityList = usuarioRepository.findAll();
        List<Usuario> usuarios = new ArrayList<>();
        for(UsuarioEntity usuarioEntity : usuarioEntityList) {
            usuarios.add(modelMapper.map(usuarioEntity, Usuario.class));
        }
        return usuarios;
    }

    @Override
    public Usuario crearUsuario(Usuario usuario) {
        if (usuarioRepository.findByUsuarioAndActivo(usuario.getUsuario()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un usuario activo con este nombre");
        }

        UsuarioEntity usuarioEntity = modelMapper.map(usuario, UsuarioEntity.class);
        usuarioEntity.setActivo(true); // Cambiar setEstado por setActivo
        usuarioEntity.setFechaCreacion(null);
        usuarioEntity.setFechaModificacion(null);

        UsuarioEntity savedEntity = usuarioRepository.save(usuarioEntity);
        return modelMapper.map(savedEntity, Usuario.class);
    }

    @Override
    public Usuario updateUsuario(Usuario usuario) {
        Optional<UsuarioEntity> usuarioEntityOptional = usuarioRepository.findById(usuario.getId());
        if (usuarioEntityOptional.isEmpty() || !usuarioEntityOptional.get().getActivo()) {
            throw new EntityNotFoundException("Usuario no encontrado con id: " + usuario.getId());
        }

        UsuarioEntity usuarioEntity = usuarioEntityOptional.get();

        if (usuario.getUsuario() != null) {
            usuarioEntity.setUsuario(usuario.getUsuario());
        }
        if (usuario.getPassword() != null) {
            usuarioEntity.setPassword(usuario.getPassword());
        }
        if (usuario.getRol() != null) {
            usuarioEntity.setRol(UsuarioEntity.Rol.valueOf(usuario.getRol()));
        }
        usuarioEntity.setActivo(usuario.getActivo() != null ? usuario.getActivo() : true);

        UsuarioEntity updatedEntity = usuarioRepository.save(usuarioEntity);
        return modelMapper.map(updatedEntity, Usuario.class);
    }

    @Override
    public void deleteUsuario(Long id) {
        UsuarioEntity usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));

        usuario.setActivo(false); // Baja lógica
        usuarioRepository.save(usuario);
    }

    @Override
    public Usuario findByUsername(String username) {
        Optional<UsuarioEntity> usuarioEntityOptional = usuarioRepository.findByUsuarioAndActivo(username);

        if (usuarioEntityOptional.isEmpty()) {
            return null;
        }

        return modelMapper.map(usuarioEntityOptional.get(), Usuario.class);
    }

    @Override
    public void toggleEstadoUsuario(Long id) {
        UsuarioEntity usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));

        // Cambiar el estado actual
        usuario.setActivo(!usuario.getActivo());
        usuarioRepository.save(usuario);
    }

    @Override
    public void resetPassword(Long id, String nuevaPassword) {
        UsuarioEntity usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));

        if (!usuario.getActivo()) {
            throw new IllegalStateException("No se puede cambiar la contraseña de un usuario inactivo");
        }

        // TODO: Encriptar la contraseña, queda pendiente!
        // usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuario.setPassword(nuevaPassword); // Por ahora sin encriptar
        usuarioRepository.save(usuario);
    }

}
