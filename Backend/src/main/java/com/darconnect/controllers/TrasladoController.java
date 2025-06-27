package com.darconnect.controllers;

import com.darconnect.dtos.*;
import com.darconnect.entities.TrasladoEntity;
import com.darconnect.models.EstadoTraslado;
import com.darconnect.models.Traslado;
import com.darconnect.services.TelegramServiceInt;
import com.darconnect.services.TrasladoService;
import com.darconnect.services.impl.GoogleMapsServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
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

    @Autowired
    private GoogleMapsServiceImpl googleMapsService;

    @Autowired
    private TelegramServiceInt telegramService;


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
        modelMapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
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
    public ResponseEntity<Map<String, Object>> iniciarTraslado(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            Long usuarioId = Long.valueOf(request.get("usuarioId").toString());
            trasladoService.iniciarTraslado(id, usuarioId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Traslado iniciado correctamente");
            response.put("timestamp", java.time.LocalDateTime.now());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<Map<String, Object>> finalizarTraslado(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            Long usuarioId = Long.valueOf(request.get("usuarioId").toString());
            trasladoService.finalizarTraslado(id, usuarioId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Traslado finalizado correctamente");
            response.put("timestamp", java.time.LocalDateTime.now());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
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
    public ResponseEntity<Map<String, Object>> cancelarTraslado(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            Long usuarioId = Long.valueOf(request.get("usuarioId").toString());
            String motivo = request.get("motivo").toString();

            trasladoService.cancelarTraslado(id, motivo, usuarioId);

            try {
                Traslado traslado = trasladoService.getTraslado(id);
                String chatIdChofer = trasladoService.getChatIdChoferByTrasladoId(id);

                // Obtener datos necesarios
                String nombrePaciente = traslado.getNombreCompletoPaciente();


                // Solo enviar si tiene chat ID configurado
                if (chatIdChofer != null && !chatIdChofer.trim().isEmpty()) {
                    telegramService.enviarMensajeCancelacion(chatIdChofer, nombrePaciente);
                } else {
                    System.out.println("⚠️ Chofer no tiene chat ID configurado - no se envió mensaje");
                }

            } catch (Exception e) {
                System.err.println("Error al enviar mensaje de Telegram: " + e.getMessage());
                e.printStackTrace();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Traslado cancelado correctamente");
            response.put("timestamp", java.time.LocalDateTime.now());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/calcular-tiempo")
    public ResponseEntity<GoogleMapsResponse> calcularTiempoTraslado(@PathVariable Long id) {
        try {
            Traslado traslado = trasladoService.getTraslado(id);

            GoogleMapsResponse response = googleMapsService.calcularDistanciaYTiempo(
                    traslado.getDireccionOrigen(),
                    traslado.getDireccionDestino()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new GoogleMapsResponse("Error calculando tiempo: " + e.getMessage()));
        }
    }
}