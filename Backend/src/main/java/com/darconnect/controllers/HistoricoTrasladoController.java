package com.darconnect.controllers;

import com.darconnect.models.EstadoTraslado;
import com.darconnect.services.HistoricoTrasladoServiceInt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/historico-traslados")
public class HistoricoTrasladoController {

    @Autowired
    private HistoricoTrasladoServiceInt historicoTrasladoService;

    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getHistoricoTraslados(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) Long choferId,
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(required = false) EstadoTraslado estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        try {
            // Debug de parámetros recibidos
            System.out.println("=== DEBUG HISTÓRICO CONTROLLER ===");
            System.out.println("fechaInicio: " + fechaInicio);
            System.out.println("fechaFin: " + fechaFin);
            System.out.println("choferId: " + choferId);
            System.out.println("pacienteId: " + pacienteId);
            System.out.println("estado: " + estado);
            System.out.println("page: " + page);
            System.out.println("size: " + size);
            System.out.println("================================");

            Map<String, Object> response = historicoTrasladoService.getHistoricoConFiltros(
                    fechaInicio, fechaFin, choferId, pacienteId, estado, page, size);

            System.out.println("Response generado: " + response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("ERROR en getHistoricoTraslados: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Error al consultar el histórico: " + e.getMessage())
            );
        }
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> getEstadisticasHistorico(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

        try {
            LocalDate inicio = fechaInicio != null ? fechaInicio : LocalDate.now().minusMonths(1);
            LocalDate fin = fechaFin != null ? fechaFin : LocalDate.now();

            Map<String, Object> estadisticas = historicoTrasladoService.getEstadisticasHistorico(inicio, fin);
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Error al obtener estadísticas: " + e.getMessage())
            );
        }
    }
}