package com.darconnect.services;

import com.darconnect.dtos.EstadisticasChoferDTO;
import com.darconnect.dtos.TrasladoDTO;
import com.darconnect.dtos.TrasladoDelDiaDTO;
import com.darconnect.models.EstadoTraslado;
import com.darconnect.models.Traslado;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public interface TrasladoService {
    Traslado getTraslado(Long id);
    List<Traslado> getTraslados();
    Traslado createTraslado(Traslado traslado);
    Traslado updateTraslado(Traslado traslado);
    void deleteTraslado(Long id);

    // Métodos específicos del negocio
    List<Traslado> getTrasladosByAgendaId(Long agendaId);
    List<Traslado> getTrasladosByPacienteId(Long pacienteId);
    List<TrasladoDelDiaDTO> getTrasladosDelDiaParaChofer(Integer choferId, LocalDate fecha);
    EstadoTraslado getEstadoActualTraslado(Long trasladoId, LocalDate fecha);
    void iniciarTraslado(Long trasladoId, Long usuarioId);
    void finalizarTraslado(Long trasladoId, Long usuarioId);
    List<TrasladoDTO> getTrasladosSemanalChofer(Long choferId, LocalDate inicioSemana);
    void cancelarTraslado(Long trasladoId, String motivo, Long usuarioId);
    List<TrasladoDelDiaDTO> getTrasladosAdmin(LocalDate fecha, EstadoTraslado estado);

    //Para telegram
    String getChatIdChoferByTrasladoId(Long trasladoId);
}