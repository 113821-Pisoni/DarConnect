package com.darconnect.services;

public interface TelegramServiceInt {
    void enviarMensaje(String chatId, String mensaje);
    void enviarMensajeCancelacion(String chatId, String nombrePaciente);
}