package com.darconnect.controllers;

import com.darconnect.dtos.LoginRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.darconnect.models.Usuario;
import com.darconnect.services.UsuarioService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
        // Buscar el usuario por username
        Usuario usuario = usuarioService.findByUsername(loginRequest.getUsername());

        // Verificar si existe y la contraseña coincide (en producción usar BCrypt)
        if (usuario != null && usuario.getPassword().equals(loginRequest.getPassword())) {
            // Crear respuesta con los datos que espera el frontend
            Map<String, Object> response = new HashMap<>();
            response.put("id", usuario.getId());
            response.put("username", usuario.getUsuario());
            response.put("role", usuario.getRol());
            response.put("token", "token-simulado-" + System.currentTimeMillis()); // Token simulado

            return ResponseEntity.ok(response);
        }

        // Credenciales inválidas
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("message", "Credenciales inválidas");
        return ResponseEntity.status(401).body(errorResponse);
    }
}
