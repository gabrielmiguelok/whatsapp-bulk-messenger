// src/services/MessageService.js

const IMessageService = require('./IMessageService');
const config = require('../utils/config');
const logger = require('../utils/logger');

/**
 * Clase que maneja el envío de mensajes y la lógica asociada.
 * Aplica el Principio de Segregación de Interfaces (ISP) y el Principio de Inversión de Dependencias (DIP).
 */
class MessageService extends IMessageService {
    constructor(clients, conversationManager) {
        super();
        this.clients = clients;
        this.conversationManager = conversationManager;
    }

    sendMessages(numbersPerClient, message) {
        for (let i = 0; i < this.clients.length; i++) {
            const client = this.clients[i];
            const numbers = numbersPerClient[i];
            this.sendMessagesFromClient(client, numbers, message, i);
        }
    }

    sendMessagesFromClient(client, numbers, message, clientIndex) {
        let messageCount = 0;
        let index = 0;

        const sendMessageInterval = setInterval(async () => {
            if (index >= numbers.length) {
                clearInterval(sendMessageInterval);
                return;
            }

            const number = numbers[index];
            await client.sendMessage(number + '@c.us', message);

            const clientInfo = client.getClientInfo();
            const myNumber = clientInfo.wid.user;
            const convo = this.conversationManager.getConversation(number, clientIndex, myNumber);
            convo.addMessage('Enviado', message);
            convo.display();

            index++;
            messageCount++;

            if (messageCount >= config.messagesBeforePause) {
                clearInterval(sendMessageInterval);
                console.log(`[Cliente ${clientIndex + 1}] Ha enviado ${config.messagesBeforePause} mensajes. Pausando por ${config.pauseDurationMinutes} minutos...`);
                setTimeout(() => {
                    messageCount = 0;
                    this.sendMessagesFromClient(client, numbers.slice(index), message, clientIndex);
                }, config.pauseDurationMinutes * 60 * 1000);
            }
        }, config.delayBetweenMessagesMs);
    }

    sendReply(conversations, replyMessage) {
        conversations.forEach((convo, idx) => {
            setTimeout(async () => {
                await this.clients[convo.clientIndex].sendMessage(convo.recipientNumber + '@c.us', replyMessage);
                convo.addMessage('Enviado', replyMessage);
                convo.display();
                logger.info(`Mensaje de respuesta enviado a ${convo.recipientNumber} desde el cliente ${convo.clientIndex + 1}.`);
            }, idx * config.delayBetweenMessagesMs);
        });
    }
}

module.exports = MessageService;
