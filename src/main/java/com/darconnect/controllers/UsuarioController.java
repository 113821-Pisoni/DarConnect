package com.darconnect.controllers;

import com.darconnect.dtos.UsuarioDTO;
import com.darconnect.models.Usuario;
import com.darconnect.services.UsuarioService;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/usuario")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private ModelMapper modelMapper;

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> getUsuario(@PathVariable Long id){
        Usuario usuario = usuarioService.getUsuario(id);
        return ResponseEntity.ok(modelMapper.map(usuario, UsuarioDTO.class));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id) {
        usuarioService.deleteUsuario(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("")
    public ResponseEntity<List<UsuarioDTO>> getAllUsuarios(){
        List<Usuario> usuariosList = usuarioService.getUsuariosList();
        List<UsuarioDTO> usuariosDTO = usuariosList.stream()
                .map(usuario -> modelMapper.map(usuario, UsuarioDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(usuariosDTO);
    }

    @PostMapping("")
    public ResponseEntity<UsuarioDTO> createUsuario(@Valid @RequestBody UsuarioDTO usuarioDTO){
        Usuario usuarioModel = modelMapper.map(usuarioDTO, Usuario.class);
        Usuario usuarioCreado = usuarioService.crearUsuario(usuarioModel);
        UsuarioDTO usuarioDTOResponse = modelMapper.map(usuarioCreado, UsuarioDTO.class);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioDTOResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDTO> updateUsuario(@PathVariable Long id, @Valid @RequestBody UsuarioDTO usuarioDTO){
        Usuario usuarioModel = modelMapper.map(usuarioDTO, Usuario.class);
        usuarioModel.setId(id);
        Usuario usuarioActualizado = usuarioService.updateUsuario(usuarioModel);
        UsuarioDTO usuarioDTOResponse = modelMapper.map(usuarioActualizado, UsuarioDTO.class);
        return ResponseEntity.ok(usuarioDTOResponse);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Void> toggleEstadoUsuario(@PathVariable Long id){
        usuarioService.toggleEstadoUsuario(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> request){
        String nuevaPassword = request.get("password");
        usuarioService.resetPassword(id, nuevaPassword);
        return ResponseEntity.ok().build();
    }
}
