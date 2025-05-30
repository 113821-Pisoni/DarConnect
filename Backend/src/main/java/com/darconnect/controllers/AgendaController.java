package com.darconnect.controllers;

import com.darconnect.dtos.AgendaCreateDTO;
import com.darconnect.dtos.AgendaDTO;
import com.darconnect.models.Agenda;
import com.darconnect.services.AgendaService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/agendas")
public class AgendaController {

    @Autowired
    private AgendaService agendaService;

    @Autowired
    private ModelMapper modelMapper;

    @GetMapping("/{id}")
    public ResponseEntity<AgendaDTO> getAgenda(@PathVariable Long id) {
        Agenda agenda = agendaService.getAgenda(id);
        AgendaDTO agendaDTO = modelMapper.map(agenda, AgendaDTO.class);
        return ResponseEntity.ok(agendaDTO);
    }

    @GetMapping("")
    public ResponseEntity<List<AgendaDTO>> getAllAgendas() {
        List<Agenda> agendas = agendaService.getAgendas();
        List<AgendaDTO> agendasDTO = agendas.stream()
                .map(agenda -> modelMapper.map(agenda, AgendaDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(agendasDTO);
    }

    @PostMapping("")
    public ResponseEntity<AgendaDTO> createAgenda(@Valid @RequestBody AgendaCreateDTO agendaCreateDTO) {
        try {
            Agenda agenda = new Agenda();
            agenda.setIdChofer(agendaCreateDTO.getIdChofer());

            Agenda agendaCreada = agendaService.createAgenda(agenda);
            AgendaDTO agendaDTOResponse = modelMapper.map(agendaCreada, AgendaDTO.class);
            return ResponseEntity.status(HttpStatus.CREATED).body(agendaDTOResponse);
        } catch (IllegalStateException e) {
            // El chofer ya tiene agenda activa - devolver la existente
            Agenda agendaExistente = agendaService.getAgendaByChoferId(agendaCreateDTO.getIdChofer());
            AgendaDTO agendaDTOResponse = modelMapper.map(agendaExistente, AgendaDTO.class);
            return ResponseEntity.ok(agendaDTOResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgendaDTO> updateAgenda(@PathVariable Long id, @Valid @RequestBody AgendaDTO agendaDTO) {
        agendaDTO.setId(id);
        Agenda agenda = modelMapper.map(agendaDTO, Agenda.class);
        Agenda agendaActualizada = agendaService.updateAgenda(agenda);
        AgendaDTO agendaDTOResponse = modelMapper.map(agendaActualizada, AgendaDTO.class);
        return ResponseEntity.ok(agendaDTOResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAgenda(@PathVariable Long id) {
        agendaService.deleteAgenda(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-chofer/{choferId}")
    public ResponseEntity<AgendaDTO> getAgendaByChoferId(@PathVariable Long choferId) {
        try {
            Agenda agenda = agendaService.getAgendaByChoferId(choferId);
            AgendaDTO agendaDTO = modelMapper.map(agenda, AgendaDTO.class);
            return ResponseEntity.ok(agendaDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}