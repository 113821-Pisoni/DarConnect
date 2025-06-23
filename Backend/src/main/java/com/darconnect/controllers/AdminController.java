package com.darconnect.controllers;

import com.darconnect.entities.ChoferEntity;
import com.darconnect.repositories.HistoricoTrasladoRepository;
import com.darconnect.repositories.ChoferRepository;
import com.darconnect.repositories.PacienteRepository;
import com.darconnect.repositories.ObraSocialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private HistoricoTrasladoRepository historicoTrasladoRepository;

    @Autowired
    private ChoferRepository choferRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private ObraSocialRepository obraSocialRepository;

    @GetMapping("/estadisticas-globales")
    public ResponseEntity<Map<String, Object>> getEstadisticasGlobales(
            @RequestParam(defaultValue = "semana") String periodo) {

        LocalDate hoy = LocalDate.now();
        LocalDate fechaInicio;
        LocalDate fechaFin;

        // Calcular rango según período
        switch (periodo.toLowerCase()) {
            case "hoy":
                fechaInicio = hoy;
                fechaFin = hoy;
                break;
            case "semana":
                fechaInicio = hoy.with(DayOfWeek.MONDAY);
                fechaFin = fechaInicio.plusDays(6);
                break;
            case "mes":
                fechaInicio = hoy.withDayOfMonth(1);
                fechaFin = hoy.withDayOfMonth(hoy.lengthOfMonth());
                break;
            case "año":
                fechaInicio = hoy.withDayOfYear(1);
                fechaFin = hoy.withDayOfYear(hoy.lengthOfYear());
                break;
            default:
                fechaInicio = hoy.with(DayOfWeek.MONDAY);
                fechaFin = fechaInicio.plusDays(6);
        }

        Map<String, Object> estadisticas = new HashMap<>();

        // Totales del sistema
        estadisticas.put("totalChoferes", choferRepository.count());
        estadisticas.put("choferesActivos", choferRepository.findAllActivos().size());
        estadisticas.put("totalPacientes", pacienteRepository.count());
        estadisticas.put("pacientesActivos", pacienteRepository.findAllActivos().size());
        estadisticas.put("totalObrasSociales", obraSocialRepository.count());
        estadisticas.put("obrasSocialesActivas", obraSocialRepository.findAllActivos().size());

        // Traslados del período (usando queries existentes - sumar todos los choferes)
        long trasladosFinalizados = historicoTrasladoRepository.countByFechaTraslado(hoy);
        long trasladosHoy = historicoTrasladoRepository.countByFechaTraslado(hoy);

        estadisticas.put("trasladosHoy", trasladosHoy);
        estadisticas.put("trasladosFinalizados", trasladosFinalizados);
        estadisticas.put("periodo", periodo);
        estadisticas.put("fechaInicio", fechaInicio.toString());
        estadisticas.put("fechaFin", fechaFin.toString());

        return ResponseEntity.ok(estadisticas);
    }

    @GetMapping("/traslados-por-chofer")
    public ResponseEntity<Map<String, Object>> getTrasladosPorChofer(
            @RequestParam(defaultValue = "semana") String periodo,
            @RequestParam(required = false) Long idChofer,
            @RequestParam(required = false) Long idPaciente,
            @RequestParam(required = false) Long idObraSocial) {

        LocalDate hoy = LocalDate.now();
        LocalDate fechaInicio;
        LocalDate fechaFin;

        // Calcular rango según período
        switch (periodo.toLowerCase()) {
            case "hoy":
                fechaInicio = hoy;
                fechaFin = hoy;
                break;
            case "semana":
                fechaInicio = hoy.with(DayOfWeek.MONDAY);
                fechaFin = fechaInicio.plusDays(6);
                break;
            case "mes":
                fechaInicio = hoy.withDayOfMonth(1);
                fechaFin = hoy.withDayOfMonth(hoy.lengthOfMonth());
                break;
            case "año":
                fechaInicio = hoy.withDayOfYear(1);
                fechaFin = hoy.withDayOfYear(hoy.lengthOfYear());
                break;
            default:
                fechaInicio = hoy.with(DayOfWeek.MONDAY);
                fechaFin = fechaInicio.plusDays(6);
        }

        Map<String, Object> resultado = new HashMap<>();

        // Filtrar choferes si se especifica
        List<ChoferEntity> choferes = choferRepository.findAllActivos();
        if (idChofer != null) {
            choferes = choferes.stream()
                    .filter(c -> c.getId().longValue() == idChofer)
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> estadisticasChoferes = choferes.stream().map(chofer -> {
            Map<String, Object> stats = new HashMap<>();
            Long choferId = chofer.getId().longValue();
            stats.put("idChofer", chofer.getId());
            stats.put("nombreCompleto", chofer.getNombre() + " " + chofer.getApellido());
            stats.put("finalizados", historicoTrasladoRepository.countTrasladosFinalizados(choferId, fechaInicio, fechaFin));
            stats.put("cancelados", historicoTrasladoRepository.countTrasladosCancelados(choferId, fechaInicio, fechaFin));
            stats.put("conSilla", historicoTrasladoRepository.countTrasladosConSilla(choferId, fechaInicio, fechaFin));
            stats.put("sinSilla", historicoTrasladoRepository.countTrasladosSinSilla(choferId, fechaInicio, fechaFin));
            return stats;
        }).collect(Collectors.toList());

        resultado.put("estadisticasChoferes", estadisticasChoferes);
        resultado.put("periodo", periodo);
        resultado.put("filtros", Map.of(
                "idChofer", idChofer != null ? idChofer : "",
                "idPaciente", idPaciente != null ? idPaciente : "",
                "idObraSocial", idObraSocial != null ? idObraSocial : ""
        ));

        return ResponseEntity.ok(resultado);
    }
}