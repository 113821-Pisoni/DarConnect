package com.darconnect.services.impl;

import com.darconnect.entities.PacienteEntity;
import com.darconnect.models.Paciente;
import com.darconnect.repositories.PacienteRepository;
import com.darconnect.repositories.TrasladoRepository;
import com.darconnect.services.PacienteService;
import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PacienteServiceImpl implements PacienteService {
    @Autowired
    PacienteRepository pacienteRepository;

    @Autowired
    TrasladoRepository trasladoRepository;

    @Autowired
    ModelMapper modelMapper;

    @Override
    public Paciente getPaciente(Long id) {
        Optional<PacienteEntity> pacienteEntityOptional = pacienteRepository.findByIdAndActivo(id);
        if (pacienteEntityOptional.isEmpty()) {
            throw new EntityNotFoundException("Paciente no encontrado.");
        }
        return modelMapper.map(pacienteEntityOptional.get(), Paciente.class);
    }

    @Override
    public List<Paciente> getPacientesActivos() {
        List<PacienteEntity> pacienteEntities = pacienteRepository.findAllActivos();
        List<Paciente> pacientes = new ArrayList<>();
        for(PacienteEntity pacienteEntity : pacienteEntities){
            pacientes.add(modelMapper.map(pacienteEntity, Paciente.class));
        }
        return pacientes;
    }

    @Override
    public List<Paciente> getPacientes() {
        List<PacienteEntity> pacienteEntities = pacienteRepository.findAll();
        List<Paciente> pacientes = new ArrayList<>();
        for(PacienteEntity pacienteEntity : pacienteEntities){
            pacientes.add(modelMapper.map(pacienteEntity, Paciente.class));
        }
        return pacientes;
    }

    @Override
    public Paciente createPaciente(Paciente paciente) {
        PacienteEntity pacienteEntity = modelMapper.map(paciente, PacienteEntity.class);
        pacienteEntity = pacienteRepository.save(pacienteEntity);
        return modelMapper.map(pacienteEntity, Paciente.class);
    }

    @Override
    public Paciente updatePaciente(Paciente paciente) {
        Optional<PacienteEntity> pacienteEntityOptional = pacienteRepository.findByIdAndActivo(paciente.getId());
        if(pacienteEntityOptional.isEmpty()){
            throw new EntityNotFoundException("Paciente no encontrado.");
        }

        PacienteEntity pacienteEntity = pacienteEntityOptional.get();

        pacienteEntity.setNombre(paciente.getNombre());
        pacienteEntity.setApellido(paciente.getApellido());
        pacienteEntity.setDni(paciente.getDni());
        pacienteEntity.setTelefono(paciente.getTelefono());
        pacienteEntity.setDireccion(paciente.getDireccion());
        pacienteEntity.setCiudad(paciente.getCiudad());
        pacienteEntity.setEmail(paciente.getEmail());
        pacienteEntity.setIdObraSocial(paciente.getIdObraSocial());
        pacienteEntity.setSillaRueda(paciente.getSillaRueda());
        pacienteEntity.setActivo(paciente.getActivo() != null ? paciente.getActivo() : true);

        pacienteEntity = pacienteRepository.save(pacienteEntity);
        return modelMapper.map(pacienteEntity, Paciente.class);
    }

    @Override
    public void deletePaciente(Long id) {
        PacienteEntity paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Paciente no encontrado."));

        // Validar que no tenga traslados activos
        if (tieneTrasladosActivos(id)) {
            throw new IllegalStateException("No se puede dar de baja al paciente porque tiene traslados activos asignados.");
        }

        paciente.setActivo(false); // Baja lógica
        pacienteRepository.save(paciente);
    }

    @Override
    public void toggleEstadoPaciente(Long id) {
        PacienteEntity paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Paciente no encontrado."));

        // Si se va a desactivar, validar que no tenga traslados activos
        if (paciente.getActivo() && tieneTrasladosActivos(id)) {
            throw new IllegalStateException("No se puede desactivar al paciente porque tiene traslados activos asignados.");
        }

        // Cambiar el estado actual
        paciente.setActivo(!paciente.getActivo());
        pacienteRepository.save(paciente);
    }

    /**
     * Verifica si un paciente tiene traslados activos asignados
     * @param pacienteId ID del paciente
     * @return true si tiene traslados activos, false en caso contrario
     */
    private boolean tieneTrasladosActivos(Long pacienteId) {
        return trasladoRepository.existsByPacienteIdAndActivoTrue(pacienteId);
    }
}