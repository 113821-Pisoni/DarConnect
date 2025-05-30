package com.darconnect.services.impl;

import com.darconnect.entities.*;
import com.darconnect.models.EstadoTraslado;
import com.darconnect.repositories.*;
import com.darconnect.services.GeneradorHistoricoService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GeneradorHistoricoServiceImpl implements GeneradorHistoricoService {

    @Autowired
    TrasladoRepository trasladoRepository;
    @Autowired
    HistoricoTrasladoRepository historicoRepository;
    @Autowired
    UsuarioRepository usuarioRepository;

    /**
     * Ejecutar todos los días a las 00:01 AM
     * Genera los registros de histórico en estado PENDIENTE para todos los traslados del día
     */
    @Scheduled(cron = "0 1 0 * * *")
    @Transactional
    public void generarHistoricosDiarios() {
        try {
            LocalDate hoy = LocalDate.now();

            // Verificar si ya fueron generados para evitar duplicados
            if (!historicosGeneradosParaHoy()) {
                generarHistoricosParaFecha(hoy);
                System.out.println("Históricos generados para: " + hoy);
            } else {
                System.out.println("Históricos ya existían para: " + hoy);
            }
        } catch (Exception e) {
            System.err.println("Error generando históricos: " + e.getMessage());
            e.printStackTrace();
            // Aquí podrías agregar logging más sofisticado
        }
    }

    /**
     * Método público para generar históricos de una fecha específica
     * Útil para testing o regeneración manual
     */
    @Transactional
    public void generarHistoricosParaFecha(LocalDate fecha) {
        String diaSemana = String.valueOf(fecha.getDayOfWeek().getValue());

        // Obtener usuario sistema para auditoría
        UsuarioEntity usuarioSistema = usuarioRepository.findByUsuario("SISTEMA")
                .orElseThrow(() -> new RuntimeException("Usuario SISTEMA no encontrado"));

        List<TrasladoEntity> trasladosDelDia = trasladoRepository.findTrasladosParaFecha(fecha, diaSemana);

        // Generar histórico para cada traslado si no existe
        for (TrasladoEntity traslado : trasladosDelDia) {
            boolean existeHistorico = historicoRepository
                    .existsByTrasladoIdAndFechaTraslado(traslado.getId(), fecha);

            if (!existeHistorico) {
                HistoricoTrasladoEntity historico = new HistoricoTrasladoEntity();
                historico.setTraslado(traslado);
                historico.setFechaTraslado(fecha);
                historico.setEstado(EstadoTraslado.PENDIENTE);
                historico.setFechaHoraCambio(LocalDateTime.now());
                historico.setUsuario(usuarioSistema);

                historicoRepository.save(historico);
            }
        }
    }

    /**
     * Método para verificar si los históricos del día ya fueron generados
     */
    public boolean historicosGeneradosParaHoy() {
        LocalDate hoy = LocalDate.now();
        String diaSemana = String.valueOf(hoy.getDayOfWeek().getValue());

        // Contar traslados que deberían tener histórico hoy (optimizado)
        long trasladosEsperados = trasladoRepository.countTrasladosParaFecha(hoy, diaSemana);

        // Contar históricos existentes para hoy
        long historicosExistentes = historicoRepository.countByFechaTraslado(hoy);

        return trasladosEsperados == historicosExistentes;
    }
}