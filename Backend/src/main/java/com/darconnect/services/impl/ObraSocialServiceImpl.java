package com.darconnect.services.impl;

import com.darconnect.entities.ObraSocialEntity;
import com.darconnect.models.ObraSocial;
import com.darconnect.repositories.ObraSocialRepository;
import com.darconnect.repositories.PacienteRepository;
import com.darconnect.services.ObraSocialService;
import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ObraSocialServiceImpl implements ObraSocialService {
    @Autowired
    ObraSocialRepository obraSocialRepository;
    @Autowired
    ModelMapper modelMapper;

    @Override
    public ObraSocial getObraSocial(Long id) {
        Optional<ObraSocialEntity> obraSocialEntityOptional = obraSocialRepository.findByIdAndActivo(id);
        if (obraSocialEntityOptional.isEmpty()) {
            throw new EntityNotFoundException("Obra Social no encontrado");
        }
        return modelMapper.map(obraSocialEntityOptional.get(), ObraSocial.class);
    }

    @Override
    public List<ObraSocial> getObrasSocialesActivas() {
        List<ObraSocialEntity> obraSocialEntities = obraSocialRepository.findAll();
        List<ObraSocial> obrasSociales = new ArrayList<>();
        for (ObraSocialEntity obraSocialEntity : obraSocialEntities) {
            obrasSociales.add(modelMapper.map(obraSocialEntity, ObraSocial.class));
        }
        return obrasSociales;
    }

    @Override
    public List<ObraSocial> getObrasSociales() {
        List<ObraSocialEntity> obraSocialEntities = obraSocialRepository.findAll();
        List<ObraSocial> obrasSociales = new ArrayList<>();
        for (ObraSocialEntity obraSocialEntity : obraSocialEntities) {
            obrasSociales.add(modelMapper.map(obraSocialEntity, ObraSocial.class));
        }
        return obrasSociales;
    }

    @Override
    public ObraSocial createObraSocial(ObraSocial obraSocial) {
        ObraSocialEntity obraSocialEntity = modelMapper.map(obraSocial, ObraSocialEntity.class);
        obraSocialEntity = obraSocialRepository.save(obraSocialEntity);
        return modelMapper.map(obraSocialEntity, ObraSocial.class);
    }

    @Override
    public ObraSocial updateObraSocial(ObraSocial obraSocial) {
        Optional<ObraSocialEntity> obraSocialEntityOptional = obraSocialRepository.findById(obraSocial.getId());
        if (obraSocialEntityOptional.isEmpty()) {
            throw new EntityNotFoundException("Obra Social no encontrado");
        }
        ObraSocialEntity obraSocialEntity = obraSocialEntityOptional.get();

        obraSocialEntity.setDescripcion(obraSocial.getDescripcion());
        obraSocialEntity.setActivo(obraSocial.getActivo()!=null ? obraSocial.getActivo(): true);
        obraSocialEntity = obraSocialRepository.save(obraSocialEntity);
        return modelMapper.map(obraSocialEntity, ObraSocial.class);
    }

    @Override
    public void deleteObraSocial(Long id) {
        ObraSocialEntity obraSocialEntity = obraSocialRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Obra Social no encontrado"));
        obraSocialEntity.setActivo(false);
        obraSocialRepository.save(obraSocialEntity);

    }

    @Override
    public void toggleEstadoObraSocial(Long id) {
        ObraSocialEntity obraSocialEntity = obraSocialRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Obra Social no encontrado."));

        // Cambiar el estado actual
        obraSocialEntity.setActivo(!obraSocialEntity.getActivo());
        obraSocialRepository.save(obraSocialEntity);
    }
}
