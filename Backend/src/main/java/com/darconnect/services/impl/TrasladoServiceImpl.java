package com.darconnect.services.impl;

import com.darconnect.dtos.TrasladoDTO;
import com.darconnect.dtos.TrasladoDelDiaDTO;
import com.darconnect.entities.*;
import com.darconnect.models.EstadoTraslado;
import com.darconnect.models.Traslado;
import com.darconnect.repositories.*;
import com.darconnect.services.TrasladoService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TrasladoServiceImpl implements TrasladoService {

    @Autowired
    private TrasladoRepository trasladoRepository;

    @Autowired
    private AgendaRepository agendaRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private HistoricoTrasladoRepository historicoTrasladoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public Traslado getTraslado(Long id) {
        Optional<TrasladoEntity> trasladoEntity = trasladoRepository.findByIdWithRelations(id);
        if (trasladoEntity.isEmpty()) {
            throw new EntityNotFoundException("Traslado no encontrado");
        }
        return mapToModel(trasladoEntity.get());
    }

    @Override
    public List<Traslado> getTraslados() {
        List<TrasladoEntity> trasladoEntityList = trasladoRepository.findAllWithRelations();
        return trasladoEntityList.stream()
                .map(this::mapToModel)
                .collect(Collectors.toList());
    }

    @Override
    public Traslado createTraslado(Traslado traslado) {
        // Validaciones
        validarTraslado(traslado);

        // Verificar que la agenda existe y está activa
        AgendaEntity agenda = agendaRepository.findById(traslado.getIdAgenda())
                .orElseThrow(() -> new EntityNotFoundException("Agenda no encontrada."));

        if (!agenda.getActivo()) {
            throw new IllegalStateException("La agenda no está activa");
        }

        // Verificar que el paciente existe y está activo
        PacienteEntity paciente = pacienteRepository.findById(traslado.getIdPaciente())
                .orElseThrow(() -> new EntityNotFoundException("Paciente no encontrado."));

        // Validar conflictos de horario
        validarConflictosHorario(traslado, null);

        // Crear entidad
        TrasladoEntity trasladoEntity = modelMapper.map(traslado, TrasladoEntity.class);
        trasladoEntity.setAgenda(agenda);
        trasladoEntity.setPaciente(paciente);
        trasladoEntity.setActivo(true);

        trasladoEntity = trasladoRepository.save(trasladoEntity);
        return mapToModel(trasladoEntity);
    }

    @Override
    public Traslado updateTraslado(Traslado traslado) {
        TrasladoEntity trasladoExistente = trasladoRepository.findByIdWithRelationsAll(traslado.getId())
                .orElseThrow(() -> new EntityNotFoundException("Traslado no encontrado."));

        // Solo validar si NO es solo un cambio de estado a inactivo
        boolean esSoloCambioEstado = traslado.getActivo() != null &&
                !traslado.getActivo() &&
                (traslado.getDiasSemana() == null || traslado.getDiasSemana().trim().isEmpty());

        if (!esSoloCambioEstado) {
            // Validaciones completas solo si NO es cambio de estado
            validarTraslado(traslado);
            validarConflictosHorario(traslado, traslado.getId());

            // Actualizar campos solo si no están vacíos
            if (traslado.getDireccionOrigen() != null) {
                trasladoExistente.setDireccionOrigen(traslado.getDireccionOrigen());
            }
            if (traslado.getDireccionDestino() != null) {
                trasladoExistente.setDireccionDestino(traslado.getDireccionDestino());
            }
            if (traslado.getHoraProgramada() != null) {
                trasladoExistente.setHoraProgramada(traslado.getHoraProgramada());
            }
            if (traslado.getDiasSemana() != null && !traslado.getDiasSemana().trim().isEmpty()) {
                trasladoExistente.setDiasSemana(traslado.getDiasSemana());
            }
            if (traslado.getFechaInicio() != null) {
                trasladoExistente.setFechaInicio(traslado.getFechaInicio());
            }
            if (traslado.getFechaFin() != null) {
                trasladoExistente.setFechaFin(traslado.getFechaFin());
            }
            if (traslado.getObservaciones() != null) {
                trasladoExistente.setObservaciones(traslado.getObservaciones());
            }
        }

        // Siempre permitir cambio de estado activo
        if (traslado.getActivo() != null) {
            trasladoExistente.setActivo(traslado.getActivo());
        }

        // Solo permitir cambiar paciente si se proporciona
        if (traslado.getIdPaciente() != null && !traslado.getIdPaciente().equals(trasladoExistente.getPaciente().getId())) {
            PacienteEntity nuevoPaciente = pacienteRepository.findById(traslado.getIdPaciente())
                    .orElseThrow(() -> new EntityNotFoundException("Paciente no encontrado."));
            trasladoExistente.setPaciente(nuevoPaciente);
        }

        trasladoExistente = trasladoRepository.save(trasladoExistente);
        return mapToModel(trasladoExistente);
    }

    @Override
    public void deleteTraslado(Long id) {
        TrasladoEntity traslado = trasladoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Traslado no encontrado."));

        traslado.setActivo(false);
        trasladoRepository.save(traslado);
    }

    @Override
    public List<Traslado> getTrasladosByAgendaId(Long agendaId) {
        List<TrasladoEntity> traslados = trasladoRepository.findByAgendaIdAndActivo(agendaId);
        return traslados.stream()
                .map(this::mapToModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<Traslado> getTrasladosByPacienteId(Long pacienteId) {
        List<TrasladoEntity> traslados = trasladoRepository.findByPacienteIdAndActivo(pacienteId);
        return traslados.stream()
                .map(this::mapToModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrasladoDelDiaDTO> getTrasladosDelDiaParaChofer(Integer choferId, LocalDate fecha) {
        String diaSemana = String.valueOf(fecha.getDayOfWeek().getValue());
        return trasladoRepository.findTrasladosDelDiaParaChofer(choferId, fecha, diaSemana);
    }

    @Override
    public EstadoTraslado getEstadoActualTraslado(Long trasladoId, LocalDate fecha) {
        return trasladoRepository.findUltimoEstadoDelDia(trasladoId, fecha)
                .orElse(EstadoTraslado.PENDIENTE);
    }

    // Métodos privados de validación
    private void validarTraslado(Traslado traslado) {
        // Validar fechas
        if (traslado.getFechaFin() != null && traslado.getFechaFin().isBefore(traslado.getFechaInicio())) {
            throw new IllegalArgumentException("La fecha fin no puede ser anterior a la fecha inicio");
        }

        // Validar formato de días de semana
        if (!validarFormatoDiasSemana(traslado.getDiasSemana())) {
            throw new IllegalArgumentException("Formato de días de semana inválido. Use formato: 1,2,3 (1=Lunes, 7=Domingo)");
        }
    }

    private boolean validarFormatoDiasSemana(String diasSemana) {
        if (diasSemana == null || diasSemana.trim().isEmpty()) {
            return false;
        }

        try {
            String[] dias = diasSemana.split(",");
            for (String dia : dias) {
                int diaNum = Integer.parseInt(dia.trim());
                if (diaNum < 1 || diaNum > 7) {
                    return false;
                }
            }
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private void validarConflictosHorario(Traslado traslado, Long trasladoIdExcluir) {
        // Extraer primer día para validación básica
        String primerDia = traslado.getDiasSemana().split(",")[0];

        boolean hayConflicto = trasladoRepository.existsConflictingTraslado(
                traslado.getIdAgenda(),
                trasladoIdExcluir,
                traslado.getHoraProgramada(),
                traslado.getFechaInicio(),
                traslado.getFechaFin(),
                primerDia
        );

        if (hayConflicto) {
            throw new IllegalStateException("Ya existe un traslado en el mismo horario y día");
        }

        validarConflictosPaciente(traslado, trasladoIdExcluir);
    }

    private Traslado mapToModel(TrasladoEntity entity) {
        Traslado traslado = modelMapper.map(entity, Traslado.class);

        // Mapear información adicional
        if (entity.getPaciente() != null) {
            traslado.setNombreCompletoPaciente(entity.getPaciente().getNombre() + " " + entity.getPaciente().getApellido());
            traslado.setSillaRueda(entity.getPaciente().getSillaRueda());
            traslado.setTelefonoPaciente(entity.getPaciente().getTelefono());
        }

        if (entity.getAgenda() != null && entity.getAgenda().getChofer() != null) {
            traslado.setNombreCompletoChofer(entity.getAgenda().getChofer().getNombre() + " " + entity.getAgenda().getChofer().getApellido());
        }

        return traslado;
    }
    @Override
    @Transactional
    public void iniciarTraslado(Long trasladoId, Long usuarioId) {
        TrasladoEntity traslado = trasladoRepository.findById(trasladoId)
                .orElseThrow(() -> new EntityNotFoundException("Traslado no encontrado."));

        UsuarioEntity usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        LocalDate fechaHoy = LocalDate.now();
        LocalDateTime ahora = LocalDateTime.now();

        Optional<HistoricoTrasladoEntity> registroExistente =
                historicoTrasladoRepository.findUltimoRegistroDelDia(trasladoId, fechaHoy);

        if (registroExistente.isPresent()) {
            HistoricoTrasladoEntity historico = registroExistente.get();

            // Solo permitir transición de PENDIENTE → INICIADO
            if (historico.getEstado() == EstadoTraslado.PENDIENTE) {
                historico.setEstado(EstadoTraslado.INICIADO);
                historico.setFechaHoraCambio(ahora);
                historico.setUsuario(usuario);

                historicoTrasladoRepository.save(historico);
            } else {
                throw new IllegalStateException("No se puede iniciar un traslado que ya está en estado: " + historico.getEstado());
            }
        } else {
            HistoricoTrasladoEntity nuevoHistorico = new HistoricoTrasladoEntity();
            nuevoHistorico.setTraslado(traslado);
            nuevoHistorico.setFechaTraslado(fechaHoy);
            nuevoHistorico.setEstado(EstadoTraslado.INICIADO);
            nuevoHistorico.setFechaHoraCambio(ahora);
            nuevoHistorico.setUsuario(usuario);

            historicoTrasladoRepository.save(nuevoHistorico);
        }
    }

    @Override
    @Transactional
    public void finalizarTraslado(Long trasladoId, Long usuarioId) {
        TrasladoEntity traslado = trasladoRepository.findById(trasladoId)
                .orElseThrow(() -> new EntityNotFoundException("Traslado no encontrado."));

        UsuarioEntity usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        LocalDate fechaHoy = LocalDate.now();
        LocalDateTime ahora = LocalDateTime.now();

        Optional<HistoricoTrasladoEntity> registroExistente =
                historicoTrasladoRepository.findUltimoRegistroDelDia(trasladoId, fechaHoy);

        if (registroExistente.isPresent()) {
            HistoricoTrasladoEntity historico = registroExistente.get();

            // Solo permitir transición de INICIADO → FINALIZADO
            if (historico.getEstado() == EstadoTraslado.INICIADO) {
                historico.setEstado(EstadoTraslado.FINALIZADO);
                historico.setFechaHoraCambio(ahora);
                historico.setUsuario(usuario);

                historicoTrasladoRepository.save(historico);
            } else {
                throw new IllegalStateException("No se puede finalizar un traslado que está en estado: " + historico.getEstado());
            }
        } else {
            throw new IllegalStateException("No se puede finalizar un traslado que no ha sido iniciado");
        }
    }

    @Override
    @Transactional
    public void cancelarTraslado(Long trasladoId, String motivo, Long usuarioId) {
        TrasladoEntity traslado = trasladoRepository.findById(trasladoId)
                .orElseThrow(() -> new EntityNotFoundException("Traslado no encontrado."));

        UsuarioEntity usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        LocalDate fechaHoy = LocalDate.now();
        LocalDateTime ahora = LocalDateTime.now();

        Optional<HistoricoTrasladoEntity> registroExistente =
                historicoTrasladoRepository.findUltimoRegistroDelDia(trasladoId, fechaHoy);

        if (registroExistente.isPresent()) {
            HistoricoTrasladoEntity historico = registroExistente.get();

            // Permitir cancelar desde PENDIENTE o INICIADO
            if (historico.getEstado() == EstadoTraslado.PENDIENTE ||
                    historico.getEstado() == EstadoTraslado.INICIADO) {

                historico.setEstado(EstadoTraslado.CANCELADO);
                historico.setFechaHoraCambio(ahora);
                historico.setUsuario(usuario);
                historico.setMotivoCancelacion(motivo);

                historicoTrasladoRepository.save(historico);
            } else {
                throw new IllegalStateException("No se puede cancelar un traslado en estado: " + historico.getEstado());
            }
        } else {
            // Crear registro de cancelación directa
            HistoricoTrasladoEntity nuevoHistorico = new HistoricoTrasladoEntity();
            nuevoHistorico.setTraslado(traslado);
            nuevoHistorico.setFechaTraslado(fechaHoy);
            nuevoHistorico.setEstado(EstadoTraslado.CANCELADO);
            nuevoHistorico.setFechaHoraCambio(ahora);
            nuevoHistorico.setUsuario(usuario);
            nuevoHistorico.setMotivoCancelacion(motivo);

            historicoTrasladoRepository.save(nuevoHistorico);
        }
    }

    @Override
    public List<TrasladoDTO> getTrasladosSemanalChofer(Long choferId, LocalDate inicioSemana) {
        // Obtener traslados activos del chofer
        List<TrasladoEntity> trasladosActivos = trasladoRepository.findByAgenda_Chofer_IdAndActivoTrue(choferId);

        List<TrasladoDTO> resultado = new ArrayList<>();
        LocalDate finSemana = inicioSemana.plusDays(6);

        for (TrasladoEntity traslado : trasladosActivos) {
            // Verificar si el traslado está vigente para esta semana
            if (traslado.getFechaFin() != null && traslado.getFechaFin().isBefore(inicioSemana)) {
                continue; // Traslado ya terminó antes de esta semana
            }
            if (traslado.getFechaInicio().isAfter(finSemana)) {
                continue; // Traslado comenzará después de esta semana
            }

            // Mapear con ModelMapper y completar campos manualmente
            TrasladoDTO dto = modelMapper.map(traslado, TrasladoDTO.class);

            // Completar campos de paciente manualmente
            if (traslado.getPaciente() != null) {
                String nombreCompleto = (traslado.getPaciente().getNombre() + " " + traslado.getPaciente().getApellido()).trim();
                dto.setNombreCompletoPaciente(nombreCompleto);
                dto.setSillaRueda(traslado.getPaciente().getSillaRueda());
                dto.setTelefonoPaciente(traslado.getPaciente().getTelefono());
            }

            // Completar campo de chofer si es necesario
            if (traslado.getAgenda() != null && traslado.getAgenda().getChofer() != null) {
                String nombreCompletoChofer = (traslado.getAgenda().getChofer().getNombre() + " " + traslado.getAgenda().getChofer().getApellido()).trim();
                dto.setNombreCompletoChofer(nombreCompletoChofer);
            }

            resultado.add(dto);
        }

        return resultado.stream()
                .sorted(Comparator.comparing(TrasladoDTO::getHoraProgramada))
                .collect(Collectors.toList());
    }

    @Override
    public List<TrasladoDelDiaDTO> getTrasladosAdmin(LocalDate fecha, EstadoTraslado estado) {
        String diaSemana = String.valueOf(fecha.getDayOfWeek().getValue());

        List<TrasladoDelDiaDTO> todosLosTraslados = trasladoRepository.findTrasladosDelDiaAdmin(fecha, diaSemana);

        if (estado != null) {
            return todosLosTraslados.stream()
                    .filter(traslado -> traslado.getEstadoActual() == estado)
                    .collect(Collectors.toList());
        }

        return todosLosTraslados;
    }

    @Override
    public String getChatIdChoferByTrasladoId(Long trasladoId) {
        Optional<TrasladoEntity> trasladoEntity = trasladoRepository.findByIdWithRelations(trasladoId);
        if (trasladoEntity.isPresent()) {
            return trasladoEntity.get().getAgenda().getChofer().getTelegramChatId();
        }
        return null;
    }

    private void validarConflictosPaciente(Traslado traslado, Long trasladoIdExcluir) {
        System.out.println("🔍 Validando conflictos para paciente ID: " + traslado.getIdPaciente());

        List<TrasladoEntity> trasladosConflictivos = trasladoRepository.findPotentialConflictsForPaciente(
                traslado.getIdPaciente(),
                trasladoIdExcluir,
                traslado.getHoraProgramada()
        );

        System.out.println("📋 Traslados encontrados: " + trasladosConflictivos.size());

        // Convertir días de semana del traslado nuevo a Set
        Set<String> diasNuevos = Arrays.stream(traslado.getDiasSemana().split(","))
                .map(String::trim)
                .collect(Collectors.toSet());

        // Verificar si algún traslado existente tiene conflicto de días
        boolean hayConflicto = trasladosConflictivos.stream()
                .anyMatch(trasladoExistente -> {
                    Set<String> diasExistentes = Arrays.stream(trasladoExistente.getDiasSemana().split(","))
                            .map(String::trim)
                            .collect(Collectors.toSet());

                    // Verificar intersección de días
                    return diasNuevos.stream().anyMatch(diasExistentes::contains);
                });

        if (hayConflicto) {
            throw new IllegalStateException("El paciente ya tiene un traslado programado en el mismo horario y día");
        }
    }

}