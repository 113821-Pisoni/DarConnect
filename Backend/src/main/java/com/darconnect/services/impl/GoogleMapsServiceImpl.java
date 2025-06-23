package com.darconnect.services.impl;

import com.darconnect.dtos.GoogleMapsResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class GoogleMapsServiceImpl {

    private static final Logger logger = LoggerFactory.getLogger(GoogleMapsServiceImpl.class);

    @Value("${google.maps.api.key}")
    private String apiKey;

    @Value("${google.maps.api.url}")
    private String apiUrl;

    private final RestClient restClient = RestClient.builder().build();

    @Cacheable(value = "googleMapsCache", key = "#origen + '_' + #destino")
    public GoogleMapsResponse calcularDistanciaYTiempo(String origen, String destino) {
        try {
            logger.info("Consultando Google Maps API: {} -> {}", origen, destino);

            String url = construirUrl(origen, destino);
            logger.info("URL construida: {}", url);

            Map<String, Object> response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(Map.class);

            logger.info("Respuesta recibida: {}", response);
            return procesarRespuesta(response);

        } catch (RestClientException e) {
            logger.error("Error en Google Maps API: {}", e.getMessage(), e);
            return new GoogleMapsResponse("Error en la consulta a Google Maps: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error inesperado: {}", e.getMessage(), e);
            return new GoogleMapsResponse("Error interno del servidor: " + e.getMessage());
        }
    }

    private String construirUrl(String origen, String destino) {
        // ✅ MEJORAR: Agregar ciudad por defecto si no la tiene
        String origenCompleto = completarDireccion(origen);
        String destinoCompleto = completarDireccion(destino);

        // ✅ DEBUG MEJORADO
        logger.info("Origen original: '{}' → Origen completo: '{}'", origen, origenCompleto);
        logger.info("Destino original: '{}' → Destino completo: '{}'", destino, destinoCompleto);

        String url = String.format("%s?origins=%s&destinations=%s&key=%s&language=es&departure_time=now&traffic_model=best_guess",
                apiUrl,
                origenCompleto.replace(" ", "%20"),
                destinoCompleto.replace(" ", "%20"),
                apiKey);

        logger.info("URL final construida: {}", url);
        return url;
    }

    /**
     * Completa la dirección con ciudad si no la tiene
     */
    private String completarDireccion(String direccion) {
        if (direccion == null || direccion.trim().isEmpty()) {
            return direccion;
        }

        String direccionTrimmed = direccion.trim();
        String direccionLower = direccionTrimmed.toLowerCase();

        // Si no contiene "Córdoba" o "Argentina", agregar
        if (!direccionLower.contains("córdoba") &&
                !direccionLower.contains("cordoba") &&
                !direccionLower.contains("argentina")) {

            String resultado = direccionTrimmed + ", Córdoba, Argentina";
            logger.info("Completando dirección: '{}' → '{}'", direccionTrimmed, resultado);
            return resultado;
        }

        logger.info("Dirección ya completa: '{}'", direccionTrimmed);
        return direccionTrimmed;
    }

    @SuppressWarnings("unchecked")
    private GoogleMapsResponse procesarRespuesta(Map<String, Object> response) {
        try {
            String status = (String) response.get("status");

            if (!"OK".equals(status)) {
                return new GoogleMapsResponse("Error en la respuesta de Google Maps: " + status);
            }

            // ✅ CORREGIDO: rows es una lista, no un mapa
            List<Map<String, Object>> rows = (List<Map<String, Object>>) response.get("rows");
            if (rows == null || rows.isEmpty()) {
                return new GoogleMapsResponse("No se encontraron rutas");
            }

            Map<String, Object> firstRow = rows.get(0);
            List<Map<String, Object>> elements = (List<Map<String, Object>>) firstRow.get("elements");

            if (elements == null || elements.isEmpty()) {
                return new GoogleMapsResponse("No se encontraron elementos en la ruta");
            }

            Map<String, Object> element = elements.get(0);
            String elementStatus = (String) element.get("status");

            if (!"OK".equals(elementStatus)) {
                if ("NOT_FOUND".equals(elementStatus)) {
                    return new GoogleMapsResponse("No se encontró una de las direcciones. Verificar que estén completas.");
                } else if ("ZERO_RESULTS".equals(elementStatus)) {
                    return new GoogleMapsResponse("No hay rutas disponibles entre las direcciones especificadas.");
                }
                return new GoogleMapsResponse("No se pudo calcular la ruta: " + elementStatus);
            }

            // Extraer datos
            Map<String, Object> duration = (Map<String, Object>) element.get("duration");
            Map<String, Object> distance = (Map<String, Object>) element.get("distance");
            Map<String, Object> durationInTraffic = (Map<String, Object>) element.get("duration_in_traffic");

            String duracionSegundos = duration.get("value").toString();
            String duracionTexto = (String) duration.get("text");
            String distanciaMetros = distance.get("value").toString();
            String distanciaTexto = (String) distance.get("text");

            // ✅ MEJORADO: Manejo de tráfico
            String traficoTexto;
            if (durationInTraffic != null) {
                traficoTexto = (String) durationInTraffic.get("text");
                logger.info("Usando tiempo con tráfico: {}", traficoTexto);
            } else {
                traficoTexto = duracionTexto; // Usar duración normal
                logger.info("No hay datos de tráfico, usando duración normal: {}", traficoTexto);
            }

            return new GoogleMapsResponse(duracionSegundos, duracionTexto, distanciaMetros, distanciaTexto, traficoTexto);

        } catch (Exception e) {
            logger.error("Error procesando respuesta de Google Maps: {}", e.getMessage(), e);
            return new GoogleMapsResponse("Error procesando la respuesta de Google Maps: " + e.getMessage());
        }
    }
}