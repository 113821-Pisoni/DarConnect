package com.darconnect.services.impl;

import com.darconnect.dtos.EstadisticasChoferDTO;
import com.darconnect.dtos.TrasladoPorDiaDTO;
import com.darconnect.entities.ChoferEntity;
import com.darconnect.entities.UsuarioEntity;
import com.darconnect.models.Chofer;
import com.darconnect.models.Usuario;
import com.darconnect.repositories.ChoferRepository;
import com.darconnect.repositories.HistoricoTrasladoRepository;
import com.darconnect.repositories.UsuarioRepository;
import com.darconnect.services.ChoferService;
import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChoferServiceImpl implements ChoferService {

    @Autowired
    private ChoferRepository choferRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private HistoricoTrasladoRepository historicoTrasladoRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public Chofer getChofer(Long id) {
        Optional<ChoferEntity> choferEntity = choferRepository.findById(id);
        if (choferEntity.isEmpty()) {
            throw new EntityNotFoundException("Chofer no encontrado con id: " + id);
        }
        return modelMapper.map(choferEntity.get(), Chofer.class);
    }

    @Override
    public Chofer createChofer(Chofer chofer) {
        // Verificar que el usuario existe
        Optional<UsuarioEntity> usuario = usuarioRepository.findById(chofer.getIdUsuario());
        if (usuario.isEmpty()) {
            throw new EntityNotFoundException("Usuario no encontrado con id: " + chofer.getIdUsuario());
        }

        // Verificar que el usuario tiene rol CHOFER
        if (!usuario.get().getRol().equals(UsuarioEntity.Rol.CHOFER)) {
            throw new IllegalArgumentException("El usuario debe tener rol CHOFER");
        }

        ChoferEntity choferEntity = modelMapper.map(chofer, ChoferEntity.class);
        choferEntity.setUsuario(usuario.get());
        choferEntity = choferRepository.save(choferEntity);

        return modelMapper.map(choferEntity, Chofer.class);
    }

    @Override
    public Chofer updateChofer(Chofer chofer) {
        Optional<ChoferEntity> choferEntityOptional = choferRepository.findById(chofer.getId());
        if (choferEntityOptional.isEmpty()) {
            throw new EntityNotFoundException("Chofer no encontrado con id: " + chofer.getId());
        }

        ChoferEntity choferEntity = choferEntityOptional.get();

        // Actualizar campos
        choferEntity.setNombre(chofer.getNombre());
        choferEntity.setApellido(chofer.getApellido());
        choferEntity.setDni(chofer.getDni());
        choferEntity.setTelefono(chofer.getTelefono());
        choferEntity.setDireccion(chofer.getDireccion());
        choferEntity.setFechaVencimientoLicencia(chofer.getFechaVencimientoLicencia());
        choferEntity.setFechaContratacion(chofer.getFechaContratacion());

        choferEntity = choferRepository.save(choferEntity);
        return modelMapper.map(choferEntity, Chofer.class);
    }

    @Override
    public void deleteChofer(Long id) {
        ChoferEntity chofer = choferRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Chofer no encontrado con id: " + id));

        chofer.setActivo(false);
        choferRepository.save(chofer);
    }

    // Cambiar getChoferes para solo mostrar activos:
    @Override
    public List<Chofer> getChoferes() {
        List<ChoferEntity> choferEntityList = choferRepository.findAll();
        return choferEntityList.stream()
                .map(chofer -> modelMapper.map(chofer, Chofer.class))
                .collect(Collectors.toList());
    }

    @Override
    public Chofer getChoferByUsuarioId(Integer usuarioId) {
        ChoferEntity choferEntity = choferRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Chofer no encontrado para el usuario con id: " + usuarioId));
        return modelMapper.map(choferEntity, Chofer.class);
    }

    @Override
    public void toggleEstadoChofer(Long id) {
        ChoferEntity chofer = choferRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Chofer no encontrado con id: " + id));

        // Cambiar el estado actual
        chofer.setActivo(!chofer.getActivo());
        choferRepository.save(chofer);
    }

    @Override
    public List<Usuario> getUsuariosDisponibles() {
        // Obtener usuarios con rol CHOFER que no tienen un chofer asignado
        List<UsuarioEntity> usuariosChofer = usuarioRepository.findByRolAndActivo(UsuarioEntity.Rol.CHOFER, true);
        List<Integer> usuariosConChofer = choferRepository.findAllUsuarioIds();

        return usuariosChofer.stream()
                .filter(usuario -> !usuariosConChofer.contains(usuario.getId().intValue()))
                .map(usuario -> modelMapper.map(usuario, Usuario.class))
                .collect(Collectors.toList());
    }

    @Override
    public EstadisticasChoferDTO getEstadisticasChofer(Long choferId, String periodo) {
        LocalDate hoy = LocalDate.now();
        LocalDate fechaInicio;
        LocalDate fechaFin;

        // Calcular rango según el período
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

        // Usar tus queries existentes
        Integer finalizados = (int) historicoTrasladoRepository
                .countTrasladosFinalizados(choferId, fechaInicio, fechaFin);

        Integer cancelados = (int) historicoTrasladoRepository
                .countTrasladosCancelados(choferId, fechaInicio, fechaFin);

        Integer conSilla = (int) historicoTrasladoRepository
                .countTrasladosConSilla(choferId, fechaInicio, fechaFin);

        Integer sinSilla = (int) historicoTrasladoRepository
                .countTrasladosSinSilla(choferId, fechaInicio, fechaFin);

        // Total = finalizados + cancelados
        Integer total = finalizados + cancelados;

        // Generar datos para el gráfico
        List<TrasladoPorDiaDTO> trasladosPorDia = generarDatosPorPeriodo(choferId, fechaInicio, fechaFin, periodo);

        return new EstadisticasChoferDTO(
                total,              // trasladosHoy (total en el período)
                finalizados,        // trasladosSemana (finalizados)
                cancelados,         // trasladosMes (cancelados)
                conSilla,
                sinSilla,
                trasladosPorDia     // nueva lista en lugar de distribucionHoras
        );
    }

    private List<TrasladoPorDiaDTO> generarDatosPorPeriodo(Long choferId, LocalDate fechaInicio, LocalDate fechaFin, String periodo) {
        List<TrasladoPorDiaDTO> resultado = new ArrayList<>();

        if ("hoy".equals(periodo)) {
            // Para hoy, mostrar solo el total del día
            Integer cantidad = (int) historicoTrasladoRepository
                    .countTrasladosFinalizados(choferId, fechaInicio, fechaFin);
            resultado.add(new TrasladoPorDiaDTO("Hoy", cantidad));

        } else if ("semana".equals(periodo)) {
            // Para semana, mostrar cada día
            String[] diasSemana = {"Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"};
            LocalDate fecha = fechaInicio;

            for (int i = 0; i < 7; i++) {
                Integer cantidad = (int) historicoTrasladoRepository
                        .countTrasladosFinalizadosByChoferAndFecha(choferId, fecha);
                resultado.add(new TrasladoPorDiaDTO(diasSemana[i], cantidad));
                fecha = fecha.plusDays(1);
            }

        } else if ("mes".equals(periodo)) {
            // Para mes, agrupar por semanas
            LocalDate fecha = fechaInicio;
            int semana = 1;

            while (!fecha.isAfter(fechaFin)) {
                LocalDate finSemana = fecha.plusDays(6);
                if (finSemana.isAfter(fechaFin)) finSemana = fechaFin;

                Integer cantidad = (int) historicoTrasladoRepository
                        .countTrasladosFinalizadosByChoferAndPeriodo(choferId, fecha, finSemana);

                resultado.add(new TrasladoPorDiaDTO("Sem " + semana, cantidad));
                fecha = fecha.plusDays(7);
                semana++;
            }

        } else if ("año".equals(periodo)) {
            // Para año, mostrar por meses
            String[] meses = {"Ene", "Feb", "Mar", "Abr", "May", "Jun",
                    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"};

            for (int mes = 1; mes <= 12; mes++) {
                LocalDate inicioMes = LocalDate.of(fechaInicio.getYear(), mes, 1);
                LocalDate finMes = inicioMes.withDayOfMonth(inicioMes.lengthOfMonth());

                if (inicioMes.isAfter(fechaFin)) break;
                if (finMes.isBefore(fechaInicio)) continue;

                Integer cantidad = (int) historicoTrasladoRepository
                        .countTrasladosFinalizadosByChoferAndPeriodo(choferId, inicioMes, finMes);

                resultado.add(new TrasladoPorDiaDTO(meses[mes-1], cantidad));
            }
        }

        return resultado;
    }

}