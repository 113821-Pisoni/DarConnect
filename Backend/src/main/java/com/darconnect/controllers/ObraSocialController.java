package com.darconnect.controllers;

import com.darconnect.dtos.ObraSocialDTO;
import com.darconnect.models.ObraSocial;
import com.darconnect.services.ObraSocialService;
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
@RequestMapping("/obras-sociales")
public class ObraSocialController {

    @Autowired
    private ObraSocialService obraSocialService;

    @Autowired
    private ModelMapper modelMapper;

    @GetMapping("/{id}")
    public ResponseEntity<ObraSocialDTO> getObraSocial(@PathVariable Long id) {
        try {
            ObraSocial obraSocial = obraSocialService.getObraSocial(id);
            ObraSocialDTO dto = modelMapper.map(obraSocial, ObraSocialDTO.class);
            return ResponseEntity.ok(dto);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            e.printStackTrace(); // Para ver el error real en logs
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("")
    public ResponseEntity<List<ObraSocialDTO>> getAllObrasSociales() {
        List<ObraSocial> obras = obraSocialService.getObrasSociales();
        List<ObraSocialDTO> dtos = obras.stream()
                .map(obra -> modelMapper.map(obra, ObraSocialDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/activas")
    public ResponseEntity<List<ObraSocialDTO>> getAllObrasSocialesActivas() {
        List<ObraSocial> obras = obraSocialService.getObrasSocialesActivas();
        List<ObraSocialDTO> dtos = obras.stream()
                .map(obra -> modelMapper.map(obra, ObraSocialDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("")
    public ResponseEntity<ObraSocialDTO> createObraSocial(@Valid @RequestBody ObraSocialDTO dto) {
        ObraSocial obra = modelMapper.map(dto, ObraSocial.class);
        ObraSocial creada = obraSocialService.createObraSocial(obra);
        ObraSocialDTO response = modelMapper.map(creada, ObraSocialDTO.class);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ObraSocialDTO> updateObraSocial(@PathVariable Long id, @Valid @RequestBody ObraSocialDTO dto) {
        ObraSocial obra = modelMapper.map(dto, ObraSocial.class);
        obra.setId(id); // Aseguramos que el ID venga del path
        ObraSocial actualizada = obraSocialService.updateObraSocial(obra);
        ObraSocialDTO response = modelMapper.map(actualizada, ObraSocialDTO.class);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteObraSocial(@PathVariable Long id) {
        obraSocialService.deleteObraSocial(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Void> toggleEstadoObraSocial(@PathVariable Long id) {
        obraSocialService.toggleEstadoObraSocial(id);
        return ResponseEntity.ok().build();
    }
}
