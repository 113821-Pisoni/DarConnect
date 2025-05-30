package com.darconnect.services.impl;

import com.darconnect.entities.ChoferEntity;
import com.darconnect.entities.UsuarioEntity;
import com.darconnect.models.Chofer;
import com.darconnect.models.Usuario;
import com.darconnect.repositories.ChoferRepository;
import com.darconnect.repositories.UsuarioRepository;
import com.darconnect.services.ChoferService;
import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChoferServiceImpl implements ChoferService {

    @Autowired
    private ChoferRepository choferRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public Chofer getChofer(Long id) {
        Optional<ChoferEntity> choferEntity = choferRepository.findById(id);
        if (choferEntity.isEmpty()) {
            throw new EntityNotFoundException("Chofer no encontrado con id: " + id);
        }
        return modelMapper.map(choferEntity.get(), Chofer.class);
    }

    @Override
    public Chofer createChofer(Chofer chofer) {
        // Verificar que el usuario existe
        Optional<UsuarioEntity> usuario = usuarioRepository.findById(chofer.getIdUsuario());
        if (usuario.isEmpty()) {
            throw new EntityNotFoundException("Usuario no encontrado con id: " + chofer.getIdUsuario());
        }

        // Verificar que el usuario tiene rol CHOFER
        if (!usuario.get().getRol().equals(UsuarioEntity.Rol.CHOFER)) {
            throw new IllegalArgumentException("El usuario debe tener rol CHOFER");
        }

        ChoferEntity choferEntity = modelMapper.map(chofer, ChoferEntity.class);
        choferEntity.setUsuario(usuario.get());
        choferEntity = choferRepository.save(choferEntity);

        return modelMapper.map(choferEntity, Chofer.class);
    }

    @Override
    public Chofer updateChofer(Chofer chofer) {
        Optional<ChoferEntity> choferEntityOptional = choferRepository.findById(chofer.getId());
        if (choferEntityOptional.isEmpty()) {
            throw new EntityNotFoundException("Chofer no encontrado con id: " + chofer.getId());
        }

        ChoferEntity choferEntity = choferEntityOptional.get();

        // Actualizar campos
        choferEntity.setNombre(chofer.getNombre());
        choferEntity.setApellido(chofer.getApellido());
        choferEntity.setDni(chofer.getDni());
        choferEntity.setTelefono(chofer.getTelefono());
        choferEntity.setDireccion(chofer.getDireccion());
        choferEntity.setFechaVencimientoLicencia(chofer.getFechaVencimientoLicencia());
        choferEntity.setFechaContratacion(chofer.getFechaContratacion());

        choferEntity = choferRepository.save(choferEntity);
        return modelMapper.map(choferEntity, Chofer.class);
    }

    @Override
    public void deleteChofer(Long id) {
        ChoferEntity chofer = choferRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Chofer no encontrado con id: " + id));

        chofer.setActivo(false);
        choferRepository.save(chofer);
    }

    // Cambiar getChoferes para solo mostrar activos:
    @Override
    public List<Chofer> getChoferes() {
        List<ChoferEntity> choferEntityList = choferRepository.findAllActivos();
        return choferEntityList.stream()
                .map(chofer -> modelMapper.map(chofer, Chofer.class))
                .collect(Collectors.toList());
    }

    @Override
    public Chofer getChoferByUsuarioId(Integer usuarioId) {
        ChoferEntity choferEntity = choferRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Chofer no encontrado para el usuario con id: " + usuarioId));
        return modelMapper.map(choferEntity, Chofer.class);
    }

    @Override
    public void toggleEstadoChofer(Long id) {
        ChoferEntity chofer = choferRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Chofer no encontrado con id: " + id));

        // Cambiar el estado actual
        chofer.setActivo(!chofer.getActivo());
        choferRepository.save(chofer);
    }

    @Override
    public List<Usuario> getUsuariosDisponibles() {
        // Obtener usuarios con rol CHOFER que no tienen un chofer asignado
        List<UsuarioEntity> usuariosChofer = usuarioRepository.findByRolAndActivo(UsuarioEntity.Rol.CHOFER, true);
        List<Integer> usuariosConChofer = choferRepository.findAllUsuarioIds();

        return usuariosChofer.stream()
                .filter(usuario -> !usuariosConChofer.contains(usuario.getId().intValue()))
                .map(usuario -> modelMapper.map(usuario, Usuario.class))
                .collect(Collectors.toList());
    }
}