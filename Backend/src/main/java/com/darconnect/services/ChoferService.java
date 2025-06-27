package com.darconnect.services;

import com.darconnect.dtos.EstadisticasChoferDTO;
import com.darconnect.models.Chofer;
import com.darconnect.models.Usuario;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ChoferService {
    Chofer getChofer(Long id);
    List<Chofer> getChoferes();
    Chofer createChofer(Chofer chofer);
    Chofer updateChofer(Chofer chofer);
    void deleteChofer(Long id);
     Chofer getChoferByUsuarioId(Integer usuarioId);
    void toggleEstadoChofer(Long id);
    List<Usuario> getUsuariosDisponibles();
    EstadisticasChoferDTO getEstadisticasChofer(Long choferId, String periodo);
}
