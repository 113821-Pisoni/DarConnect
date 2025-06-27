package com.darconnect.controllers;

import com.darconnect.dtos.ChoferDTO;
import com.darconnect.dtos.EstadisticasChoferDTO;
import com.darconnect.dtos.UsuarioDTO;
import com.darconnect.models.Chofer;
import com.darconnect.models.Usuario;
import com.darconnect.services.ChoferService;
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
@RequestMapping("/choferes")
public class ChoferController {

    @Autowired
    private ChoferService choferService;

    @Autowired
    private ModelMapper modelMapper;

    @GetMapping("/{id}")
    public ResponseEntity<ChoferDTO> getChofer(@PathVariable Long id) {
        Chofer chofer = choferService.getChofer(id);
        ChoferDTO choferDTO = modelMapper.map(chofer, ChoferDTO.class);
        return ResponseEntity.ok(choferDTO);
    }

    @GetMapping("")
    public ResponseEntity<List<ChoferDTO>> getAllChoferes() {
        List<Chofer> choferes = choferService.getChoferes();
        List<ChoferDTO> choferesDTO = choferes.stream()
                .map(chofer -> modelMapper.map(chofer, ChoferDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(choferesDTO);
    }

    @PostMapping("")
    public ResponseEntity<ChoferDTO> createChofer(@Valid @RequestBody ChoferDTO choferDTO) {
        Chofer chofer = modelMapper.map(choferDTO, Chofer.class);
        Chofer choferCreado = choferService.createChofer(chofer);
        ChoferDTO choferDTOResponse = modelMapper.map(choferCreado, ChoferDTO.class);
        return ResponseEntity.status(HttpStatus.CREATED).body(choferDTOResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChoferDTO> updateChofer(@PathVariable Long id, @Valid @RequestBody ChoferDTO choferDTO) {
        Chofer chofer = modelMapper.map(choferDTO, Chofer.class);
        Chofer choferActualizado = choferService.updateChofer(chofer);
        ChoferDTO choferDTOResponse = modelMapper.map(choferActualizado, ChoferDTO.class);
        return ResponseEntity.ok(choferDTOResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChofer(@PathVariable Long id) {
        choferService.deleteChofer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-usuario/{usuarioId}")
    public ResponseEntity<ChoferDTO> getChoferByUsuarioId(@PathVariable Integer usuarioId) {
        try {
            Chofer chofer = choferService.getChoferByUsuarioId(usuarioId);
            ChoferDTO choferDTO = modelMapper.map(chofer, ChoferDTO.class);
            return ResponseEntity.ok(choferDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Void> toggleEstadoChofer(@PathVariable Long id) {
        choferService.toggleEstadoChofer(id);
        return ResponseEntity.ok().build();
    }

    // Obtener usuarios disponibles (sin chofer asignado)
    @GetMapping("/usuarios-disponibles")
    public ResponseEntity<List<UsuarioDTO>> getUsuariosDisponibles() {
        List<Usuario> usuarios = choferService.getUsuariosDisponibles();
        List<UsuarioDTO> usuariosDTO = usuarios.stream()
                .map(usuario -> modelMapper.map(usuario, UsuarioDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(usuariosDTO);
    }

    @GetMapping("/{choferId}/estadisticas")
    public ResponseEntity<EstadisticasChoferDTO> getEstadisticasChofer(
            @PathVariable Long choferId,
            @RequestParam(defaultValue = "semana") String periodo) {
        try {
            EstadisticasChoferDTO estadisticas = choferService.getEstadisticasChofer(choferId, periodo);
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}