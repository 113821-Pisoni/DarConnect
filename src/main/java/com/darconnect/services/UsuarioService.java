package com.darconnect.services;

import com.darconnect.models.Usuario;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UsuarioService {

    Usuario getUsuario(Long id);
    List<Usuario>getUsuariosList();
    Usuario crearUsuario(Usuario usuario);
    void deleteUsuario(Long id);
    Usuario findByUsername(String username);
    Usuario updateUsuario(Usuario usuario);
    void toggleEstadoUsuario(Long id);
    void resetPassword(Long id, String nuevaPassword);

}
