package com.darconnect.services;

import com.darconnect.models.Paciente;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface PacienteService {

    Paciente getPaciente(Long id);
    List<Paciente> getPacientesActivos();
    Paciente createPaciente(Paciente paciente);
    Paciente updatePaciente(Paciente paciente);
    void deletePaciente(Long id);
    void toggleEstadoPaciente(Long id);
    List<Paciente> getPacientes();
}
