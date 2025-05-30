package com.darconnect.services;

import com.darconnect.models.Agenda;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AgendaService {
    Agenda getAgenda(Long id);
    List<Agenda> getAgendas();
    Agenda createAgenda(Agenda agenda);
    Agenda updateAgenda(Agenda agenda);
    void deleteAgenda(Long id);
    Agenda getAgendaByChoferId(Long choferId);
}