package com.darconnect.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Permitir credenciales
        config.setAllowCredentials(true);

        // Opción 1: Especificar explícitamente los orígenes permitidos
        config.addAllowedOrigin("http://localhost:4200");
        // Si tienes más orígenes (como un entorno de producción), añádelos aquí
        // config.addAllowedOrigin("https://tu-dominio.com");

        // Opción 2 (alternativa): Usar patrones de origen en lugar de orígenes específicos
        // config.addAllowedOriginPattern("*");

        // Permitir todos los encabezados y métodos
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}