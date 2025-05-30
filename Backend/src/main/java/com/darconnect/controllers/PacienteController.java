package com.darconnect.controllers;

import com.darconnect.dtos.PacienteDTO;
import com.darconnect.models.Paciente;
import com.darconnect.services.PacienteService;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pacientes")
public class PacienteController {
    @Autowired
    private PacienteService pacienteService;

    @Autowired
    private ModelMapper modelMapper;

    @GetMapping("/{id}")
    public ResponseEntity<PacienteDTO> getPaciente(@PathVariable Long id) {
        Paciente paciente = pacienteService.getPaciente(id);
        PacienteDTO pacienteDTO = modelMapper.map(paciente, PacienteDTO.class);
        return ResponseEntity.ok(pacienteDTO);
    }

    @GetMapping("/activos")
    public ResponseEntity<List<PacienteDTO>> getAllPacientesActivos() {
        List<Paciente> pacientes = pacienteService.getPacientesActivos();
        List<PacienteDTO> pacientesDTO = pacientes.stream()
                .map(paciente -> modelMapper.map(paciente, PacienteDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(pacientesDTO);
    }

    @GetMapping("")
    public ResponseEntity<List<PacienteDTO>> getAllPacientes() {
        List<Paciente> pacientes = pacienteService.getPacientes();
        List<PacienteDTO> pacientesDTO = pacientes.stream()
                .map(paciente -> modelMapper.map(paciente, PacienteDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(pacientesDTO);
    }

    @PostMapping("")
    public ResponseEntity<PacienteDTO> createPaciente(@Valid @RequestBody PacienteDTO pacienteDTO) {
        Paciente paciente = modelMapper.map(pacienteDTO, Paciente.class);
        Paciente pacienteCreado = pacienteService.createPaciente(paciente);
        PacienteDTO pacienteDTOResponse = modelMapper.map(pacienteCreado, PacienteDTO.class);
        return ResponseEntity.status(HttpStatus.CREATED).body(pacienteDTOResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PacienteDTO> updatePaciente(@PathVariable Long id, @Valid @RequestBody PacienteDTO pacienteDTO) {
        Paciente paciente = modelMapper.map(pacienteDTO, Paciente.class);
        Paciente pacienteActualizado = pacienteService.updatePaciente(paciente);
        PacienteDTO pacienteDTOResponse = modelMapper.map(pacienteActualizado, PacienteDTO.class);
        return ResponseEntity.ok(pacienteDTOResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaciente(@PathVariable Long id) {
        pacienteService.deletePaciente(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Void> toggleEstadoPaciente(@PathVariable Long id) {
        pacienteService.toggleEstadoPaciente(id);
        return ResponseEntity.ok().build();
    }
}
