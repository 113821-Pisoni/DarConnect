package com.darconnect.controllers;

import com.darconnect.services.GeneradorHistoricoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/test")
public class TestController {

    @Autowired
    private GeneradorHistoricoService generadorHistoricoService;

    @PostMapping("/generar-historicos")
    public ResponseEntity<String> generarHistoricosManual() {
        try {
            generadorHistoricoService.generarHistoricosParaFecha(LocalDate.now());
            return ResponseEntity.ok("Históricos generados correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}