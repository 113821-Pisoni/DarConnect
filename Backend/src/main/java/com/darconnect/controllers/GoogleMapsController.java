package com.darconnect.controllers;

import com.darconnect.dtos.GoogleMapsRequest;
import com.darconnect.dtos.GoogleMapsResponse;
import com.darconnect.services.impl.GoogleMapsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/maps")
@CrossOrigin(origins = "*")
public class GoogleMapsController {

    @Autowired
    private GoogleMapsServiceImpl googleMapsService;

    @PostMapping("/tiempo-ruta")
    public ResponseEntity<GoogleMapsResponse> calcularTiempoRuta(@RequestBody GoogleMapsRequest request) {

        if (request.getOrigen() == null || request.getOrigen().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new GoogleMapsResponse("El origen es requerido"));
        }

        if (request.getDestino() == null || request.getDestino().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new GoogleMapsResponse("El destino es requerido"));
        }

        GoogleMapsResponse response = googleMapsService.calcularDistanciaYTiempo(
                request.getOrigen().trim(),
                request.getDestino().trim()
        );

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}