package com.darconnect.services.impl;

import com.darconnect.services.TelegramServiceInt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class TelegramServiceImpl implements TelegramServiceInt {

    @Value("${telegram.bot.token}")
    private String botToken;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void enviarMensaje(String chatId, String mensaje) {
        if (chatId == null || chatId.trim().isEmpty()) {
            System.out.println("No se puede enviar mensaje: chatId vacío");
            return;
        }

        try {
            String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";

            Map<String, Object> request = new HashMap<>();
            request.put("chat_id", chatId);
            request.put("text", mensaje);

            restTemplate.postForObject(url, request, String.class);
            System.out.println("Mensaje enviado a Telegram: " + mensaje);

        } catch (Exception e) {
            System.err.println("Error enviando mensaje de Telegram: " + e.getMessage());
        }
    }

    @Override
    public void enviarMensajeCancelacion(String chatId, String nombrePaciente) {
        String mensaje = "🚫 TRASLADO CANCELADO\n\n" +
                "Se canceló el traslado de: " + nombrePaciente + "\n\n" +
                "Por favor, contacta a administración para más detalles.";
        enviarMensaje(chatId, mensaje);
    }
}