package com.darconnect.controllers;

import com.darconnect.dtos.TrasladoCreateDTO;
import com.darconnect.dtos.TrasladoDTO;
import com.darconnect.dtos.TrasladoDelDiaDTO;
import com.darconnect.models.EstadoTraslado;
import com.darconnect.models.Traslado;
import com.darconnect.services.TrasladoService;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/traslados")
public class TrasladoController {

    @Autowired
    private TrasladoService trasladoService;

    @Autowired
    private ModelMapper modelMapper;

    @GetMapping("/{id}")
    public ResponseEntity<TrasladoDTO> getTraslado(@PathVariable Long id) {
        Traslado traslado = trasladoService.getTraslado(id);
        TrasladoDTO trasladoDTO = modelMapper.map(traslado, TrasladoDTO.class);
        return ResponseEntity.ok(trasladoDTO);
    }

    @GetMapping("")
    public ResponseEntity<List<TrasladoDTO>> getAllTraslados() {
        List<Traslado> traslados = trasladoService.getTraslados();
        List<TrasladoDTO> trasladosDTO = traslados.stream()
                .map(traslado -> modelMapper.map(traslado, TrasladoDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(trasladosDTO);
    }

    @PostMapping("")
    public ResponseEntity<TrasladoDTO> createTraslado(@Valid @RequestBody TrasladoCreateDTO trasladoCreateDTO) {
        Traslado traslado = modelMapper.map(trasladoCreateDTO, Traslado.class);
        Traslado trasladoCreado = trasladoService.createTraslado(traslado);
        TrasladoDTO trasladoDTOResponse = modelMapper.map(trasladoCreado, TrasladoDTO.class);
        return ResponseEntity.status(HttpStatus.CREATED).body(trasladoDTOResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrasladoDTO> updateTraslado(@PathVariable Long id, @Valid @RequestBody TrasladoDTO trasladoDTO) {
        trasladoDTO.setId(id);
        Traslado traslado = modelMapper.map(trasladoDTO, Traslado.class);
        Traslado trasladoActualizado = trasladoService.updateTraslado(traslado);
        TrasladoDTO trasladoDTOResponse = modelMapper.map(trasladoActualizado, TrasladoDTO.class);
        return ResponseEntity.ok(trasladoDTOResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTraslado(@PathVariable Long id) {
        trasladoService.deleteTraslado(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-agenda/{agendaId}")
    public ResponseEntity<List<TrasladoDTO>> getTrasladosByAgenda(@PathVariable Long agendaId) {
        List<Traslado> traslados = trasladoService.getTrasladosByAgendaId(agendaId);
        List<TrasladoDTO> trasladosDTO = traslados.stream()
                .map(traslado -> modelMapper.map(traslado, TrasladoDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(trasladosDTO);
    }

    @GetMapping("/by-paciente/{pacienteId}")
    public ResponseEntity<List<TrasladoDTO>> getTrasladosByPaciente(@PathVariable Long pacienteId) {
        List<Traslado> traslados = trasladoService.getTrasladosByPacienteId(pacienteId);
        List<TrasladoDTO> trasladosDTO = traslados.stream()
                .map(traslado -> modelMapper.map(traslado, TrasladoDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(trasladosDTO);
    }

    @GetMapping("/chofer/{choferId}/dia")
    public ResponseEntity<List<TrasladoDelDiaDTO>> getTrasladosDelDia(
            @PathVariable Integer choferId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {

        // Si no se proporciona fecha, usar hoy
        LocalDate fechaConsulta = fecha != null ? fecha : LocalDate.now();

        List<TrasladoDelDiaDTO> traslados = trasladoService.getTrasladosDelDiaParaChofer(choferId, fechaConsulta);
        return ResponseEntity.ok(traslados);
    }

    @GetMapping("/{id}/estado")
    public ResponseEntity<EstadoTraslado> getEstadoTraslado(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {

        LocalDate fechaConsulta = fecha != null ? fecha : LocalDate.now();
        EstadoTraslado estado = trasladoService.getEstadoActualTraslado(id, fechaConsulta);
        return ResponseEntity.ok(estado);
    }

    // Endpoint para obtener traslados activos únicamente
    @GetMapping("/activos")
    public ResponseEntity<List<TrasladoDTO>> getTrasladosActivos() {
        List<Traslado> traslados = trasladoService.getTraslados(); // Ya filtra por activos
        List<TrasladoDTO> trasladosDTO = traslados.stream()
                .map(traslado -> modelMapper.map(traslado, TrasladoDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(trasladosDTO);
    }

    @PostMapping("/{id}/iniciar")
    public ResponseEntity<Void> iniciarTraslado(@PathVariable Long id) {
        trasladoService.iniciarTraslado(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<Void> finalizarTraslado(@PathVariable Long id) {
        trasladoService.finalizarTraslado(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/chofer/{choferId}/semana")
    public ResponseEntity<Map<String, Object>> getTrasladosSemanaChofer(@PathVariable Long choferId) {
        try {
            LocalDate inicioSemana = LocalDate.now().with(DayOfWeek.MONDAY);
            LocalDate finSemana = inicioSemana.plusDays(6);

            List<TrasladoDTO> traslados = trasladoService.getTrasladosSemanalChofer(choferId, inicioSemana);

            Map<String, Object> response = new HashMap<>();
            response.put("inicioSemana", inicioSemana);
            response.put("finSemana", finSemana);
            response.put("traslados", traslados);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener agenda semanal"));
        }
    }
    @GetMapping("/admin/dia")
    public ResponseEntity<List<TrasladoDelDiaDTO>> getTrasladosDelDiaAdmin(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) EstadoTraslado estado) {

        LocalDate fechaConsulta = fecha != null ? fecha : LocalDate.now();
        List<TrasladoDelDiaDTO> traslados = trasladoService.getTrasladosAdmin(fechaConsulta, estado);
        return ResponseEntity.ok(traslados);
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelarTraslado(
            @PathVariable Long id,
            @RequestParam String motivo) {
        trasladoService.cancelarTraslado(id, motivo);
        return ResponseEntity.ok().build();
    }
}