package com.darconnect.services.impl;

import com.darconnect.models.EstadoTraslado;
import com.darconnect.repositories.HistoricoTrasladoRepository;
import com.darconnect.services.HistoricoTrasladoServiceInt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HistoricoTrasladoServiceImpl implements HistoricoTrasladoServiceInt {

    @Autowired
    private HistoricoTrasladoRepository historicoTrasladoRepository;

    @Override
    public Map<String, Object> getHistoricoConFiltros(
            LocalDate fechaInicio,
            LocalDate fechaFin,
            Long choferId,
            Long pacienteId,
            EstadoTraslado estado,
            int page,
            int size) {

        try {
            System.out.println("=== DEBUG SERVICE ===");
            System.out.println("Ejecutando consulta con parámetros:");
            System.out.println("  fechaInicio: " + fechaInicio);
            System.out.println("  fechaFin: " + fechaFin);
            System.out.println("  choferId: " + choferId);
            System.out.println("  pacienteId: " + pacienteId);
            System.out.println("  estado: " + estado);
            System.out.println("  page: " + page);
            System.out.println("  size: " + size);

            int offset = page * size;
            String estadoStr = estado != null ? estado.name() : null;

            System.out.println("  offset calculado: " + offset);
            System.out.println("  estadoStr: " + estadoStr);

            // Obtener datos
            System.out.println("Ejecutando query principal...");
            List<Object[]> resultados = historicoTrasladoRepository.findHistoricoConFiltros(
                    fechaInicio, fechaFin, choferId, pacienteId, estadoStr, size, offset);

            System.out.println("Resultados obtenidos: " + (resultados != null ? resultados.size() : "null"));

            // Contar total
            System.out.println("Ejecutando query de conteo...");
            long total = historicoTrasladoRepository.countHistoricoConFiltros(
                    fechaInicio, fechaFin, choferId, pacienteId, estadoStr);

            System.out.println("Total encontrado: " + total);

            // Convertir a Map simples (sin DTO complejo)
            System.out.println("Convirtiendo resultados...");
            List<Map<String, Object>> historicos = resultados.stream()
                    .map(this::mapRowToMap)
                    .collect(Collectors.toList());

            System.out.println("Historicos convertidos: " + historicos.size());

            // Calcular paginación
            int totalPages = (int) Math.ceil((double) total / size);

            Map<String, Object> response = new HashMap<>();
            response.put("content", historicos);
            response.put("totalElements", total);
            response.put("totalPages", totalPages);
            response.put("size", size);
            response.put("number", page);
            response.put("first", page == 0);
            response.put("last", page >= totalPages - 1);

            System.out.println("Response construido exitosamente");
            System.out.println("====================");

            return response;

        } catch (Exception e) {
            System.err.println("ERROR en getHistoricoConFiltros: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public Map<String, Object> getEstadisticasHistorico(LocalDate fechaInicio, LocalDate fechaFin) {
        Map<String, Object> estadisticas = new HashMap<>();

        List<Object[]> estadosCount = historicoTrasladoRepository.getEstadisticasEstados(fechaInicio, fechaFin);

        long total = 0;
        long finalizados = 0;
        long cancelados = 0;
        long iniciados = 0;
        long pendientes = 0;

        for (Object[] row : estadosCount) {
            String estado = (String) row[0];
            long cantidad = ((Number) row[1]).longValue();
            total += cantidad;

            switch (EstadoTraslado.valueOf(estado)) {
                case FINALIZADO -> finalizados = cantidad;
                case CANCELADO -> cancelados = cantidad;
                case INICIADO -> iniciados = cantidad;
                case PENDIENTE -> pendientes = cantidad;
            }
        }

        estadisticas.put("total", total);
        estadisticas.put("finalizados", finalizados);
        estadisticas.put("cancelados", cancelados);
        estadisticas.put("iniciados", iniciados);
        estadisticas.put("pendientes", pendientes);

        return estadisticas;
    }

    private Map<String, Object> mapRowToMap(Object[] row) {
        try {
            Map<String, Object> item = new HashMap<>();

            // Validar que tenemos suficientes columnas
            if (row.length < 26) {
                System.err.println("Error: Row tiene menos columnas de las esperadas: " + row.length);
                return item;
            }

            // Datos del histórico - con validación de null
            item.put("id", row[0] != null ? ((Number) row[0]).longValue() : 0L);
            item.put("trasladoId", row[1] != null ? ((Number) row[1]).longValue() : 0L);
            item.put("fechaTraslado", row[2] != null ? ((Date) row[2]).toLocalDate().toString() : "");
            item.put("fechaHoraCambio", row[3] != null ? ((Timestamp) row[3]).toLocalDateTime().toString() : "");
            item.put("estado", row[4] != null ? (String) row[4] : "");
            item.put("motivo", row[5] != null ? (String) row[5] : null);

            // Datos del traslado
            Map<String, Object> traslado = new HashMap<>();
            traslado.put("id", row[1] != null ? ((Number) row[1]).longValue() : 0L);
            traslado.put("horaProgramada", row[6] != null ? ((Time) row[6]).toLocalTime() : null);
            traslado.put("observaciones", row[7] != null ? (String) row[7] : null);
            traslado.put("activo", row[8] != null ? (Boolean) row[8] : false);
            traslado.put("diasSemana", row[9] != null ? (String) row[9] : null);

            // Datos del paciente
            Map<String, Object> paciente = new HashMap<>();
            paciente.put("id", row[12] != null ? ((Number) row[12]).longValue() : 0L);
            paciente.put("nombre", row[13] != null ? (String) row[13] : "");
            paciente.put("apellido", row[14] != null ? (String) row[14] : "");
            paciente.put("dni", row[15] != null ? (String) row[15] : "");
            paciente.put("telefono", row[16] != null ? (String) row[16] : null);
            paciente.put("direccion", row[17] != null ? (String) row[17] : null);
            paciente.put("ciudad", row[18] != null ? (String) row[18] : null);
            paciente.put("sillaRueda", row[19] != null ? (Boolean) row[19] : false);

            // Datos del chofer
            Map<String, Object> chofer = new HashMap<>();
            chofer.put("id", row[20] != null ? ((Number) row[20]).longValue() : 0L);
            chofer.put("nombre", row[21] != null ? (String) row[21] : "");
            chofer.put("apellido", row[22] != null ? (String) row[22] : "");
            chofer.put("dni", row[23] != null ? (String) row[23] : "");
            chofer.put("telefono", row[24] != null ? (String) row[24] : null);
            chofer.put("activo", row[25] != null ? (Boolean) row[25] : false);

            // Datos de la agenda
            Map<String, Object> agenda = new HashMap<>();
            if (row.length > 26) {
                agenda.put("id", row[26] != null ? ((Number) row[26]).longValue() : 0L);
            }
            if (row.length > 27) {
                agenda.put("activo", row[27] != null ? (Boolean) row[27] : false);
            }
            agenda.put("fechaInicio", row[10] != null ? ((Date) row[10]).toLocalDate().toString() : "");
            agenda.put("fechaFin", row[11] != null ? ((Date) row[11]).toLocalDate().toString() : "");
            agenda.put("diasSemana", row[9] != null ? (String) row[9] : null);
            agenda.put("chofer", chofer);

            // Ensamblar
            traslado.put("paciente", paciente);
            traslado.put("agenda", agenda);
            item.put("traslado", traslado);

            return item;

        } catch (Exception e) {
            System.err.println("Error en mapRowToMap: " + e.getMessage());
            e.printStackTrace();
            System.err.println("Row length: " + (row != null ? row.length : "null"));
            if (row != null) {
                for (int i = 0; i < row.length; i++) {
                    System.err.println("  [" + i + "]: " + row[i] + " (" + (row[i] != null ? row[i].getClass().getSimpleName() : "null") + ")");
                }
            }
            return new HashMap<>();
        }
    }
}