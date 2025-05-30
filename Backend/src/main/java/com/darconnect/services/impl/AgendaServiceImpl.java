package com.darconnect.services.impl;

import com.darconnect.entities.AgendaEntity;
import com.darconnect.entities.ChoferEntity;
import com.darconnect.models.Agenda;
import com.darconnect.repositories.AgendaRepository;
import com.darconnect.repositories.ChoferRepository;
import com.darconnect.services.AgendaService;
import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AgendaServiceImpl implements AgendaService {

    @Autowired
    private AgendaRepository agendaRepository;

    @Autowired
    private ChoferRepository choferRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public Agenda getAgenda(Long id) {
        Optional<AgendaEntity> agendaEntity = agendaRepository.findByIdWithChofer(id);
        if (agendaEntity.isEmpty()) {
            throw new EntityNotFoundException("Agenda no encontrada con id: " + id);
        }
        return mapToModel(agendaEntity.get());
    }

    @Override
    public List<Agenda> getAgendas() {
        List<AgendaEntity> agendaEntityList = agendaRepository.findAllActivasWithChofer();
        return agendaEntityList.stream()
                .map(this::mapToModel)
                .collect(Collectors.toList());
    }

    @Override
    public Agenda createAgenda(Agenda agenda) {
        // Verificar que el chofer existe y está activo
        ChoferEntity chofer = choferRepository.findById(agenda.getIdChofer())
                .orElseThrow(() -> new EntityNotFoundException("Chofer no encontrado con id: " + agenda.getIdChofer()));

        // Verificar que el chofer no tenga ya una agenda activa
        Optional<AgendaEntity> agendaExistente = agendaRepository.findByChoferIdAndActivo(agenda.getIdChofer());
        if (agendaExistente.isPresent()) {
            throw new IllegalStateException("El chofer ya tiene una agenda activa con id: " + agendaExistente.get().getId());
        }

        AgendaEntity agendaEntity = new AgendaEntity();
        agendaEntity.setChofer(chofer);
        agendaEntity.setActivo(true);

        agendaEntity = agendaRepository.save(agendaEntity);
        return mapToModel(agendaEntity);
    }

    @Override
    public Agenda updateAgenda(Agenda agenda) {
        AgendaEntity agendaEntity = agendaRepository.findByIdWithChofer(agenda.getId())
                .orElseThrow(() -> new EntityNotFoundException("Agenda no encontrada con id: " + agenda.getId()));

        // Solo se puede actualizar el estado activo
        agendaEntity.setActivo(agenda.getActivo());

        agendaEntity = agendaRepository.save(agendaEntity);
        return mapToModel(agendaEntity);
    }

    @Override
    public void deleteAgenda(Long id) {
        AgendaEntity agenda = agendaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Agenda no encontrada con id: " + id));

        agenda.setActivo(false);
        agendaRepository.save(agenda);
    }

    @Override
    public Agenda getAgendaByChoferId(Long choferId) {
        AgendaEntity agendaEntity = agendaRepository.findByChoferIdAndActivo(choferId)
                .orElseThrow(() -> new EntityNotFoundException("Agenda no encontrada para el chofer con id: " + choferId));
        return mapToModel(agendaEntity);
    }

    private Agenda mapToModel(AgendaEntity entity) {
        Agenda agenda = modelMapper.map(entity, Agenda.class);
        if (entity.getChofer() != null) {
            agenda.setNombreChofer(entity.getChofer().getNombre());
            agenda.setApellidoChofer(entity.getChofer().getApellido());
        }
        return agenda;
    }
}