package com.darconnect.services;


import com.darconnect.models.ObraSocial;

import java.util.List;

public interface ObraSocialService {
    ObraSocial getObraSocial(Long id);
    List<ObraSocial> getObrasSocialesActivas();
    List<ObraSocial> getObrasSociales();
    ObraSocial createObraSocial(ObraSocial obraSocial);
    ObraSocial updateObraSocial(ObraSocial obraSocial);
    void deleteObraSocial(Long id);
    void toggleEstadoObraSocial(Long id);
}
