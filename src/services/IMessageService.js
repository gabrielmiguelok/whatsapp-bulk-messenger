// src/services/IMessageService.js

/**
 * Interfaz para el servicio de mensajería.
 */
class IMessageService {
    sendMessages(numbersPerClient, message) {}
    sendReply(conversations, replyMessage) {}
}

module.exports = IMessageService;
