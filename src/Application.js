// src/Application.js

const WhatsAppClientFactory = require('./clients/WhatsAppClientFactory');
const WhatsAppClientManager = require('./clients/WhatsAppClientManager');
const ConversationManager = require('./conversations/ConversationManager');
const MessageService = require('./services/MessageService');
const UserInterface = require('./ui/UserInterface');
const config = require('./utils/config');
const logger = require('./utils/logger');

/**
 * Clase principal que coordina toda la aplicación.
 * Aplica el Principio de Inversión de Dependencias (DIP) al depender de abstracciones en lugar de implementaciones concretas.
 */
class Application {
    constructor() {
        const clientFactory = new WhatsAppClientFactory();
        this.clientManager = new WhatsAppClientManager(clientFactory);
        this.conversationManager = new ConversationManager();
        this.messageService = null;
        this.ui = new UserInterface(this.conversationManager, this.processReply.bind(this));
    }

    async run() {
        try {
            const numAccounts = config.numAccounts;

            await this.clientManager.initializeClients(numAccounts);
            const clients = this.clientManager.getClients();

            clients.forEach((client) => {
                client.setMessageHandler(this.handleIncomingMessage.bind(this));
            });

            const numbers = config.numbers;
            if (!Array.isArray(numbers) || numbers.length === 0) {
                console.log('La configuración "numbers" está vacía o no contiene números válidos.');
                logger.warn('Configuración "numbers" vacía o sin números válidos.');
                process.exit(1);
            }

            const message = config.message;
            if (typeof message !== 'string' || message.trim() === '') {
                console.log('La configuración "message" está vacía o no es válida.');
                logger.warn('Configuración "message" está vacía o no es válida.');
                process.exit(1);
            }

            const numbersPerClient = this.divideEqually(numbers, numAccounts);
            this.messageService = new MessageService(clients, this.conversationManager);
            this.messageService.sendMessages(numbersPerClient, message);

            console.log('Todos los mensajes han sido programados para envío.');
            logger.info('Proceso de envío de mensajes iniciado.');

            // Iniciar la interfaz de usuario
            await this.ui.showMainMenu();
        } catch (error) {
            console.error(`Error: ${error.message}`);
            logger.error(`Error en la aplicación: ${error.stack}`);
            process.exit(1);
        }
    }

    divideEqually(arr, numGroups) {
        const perGroup = Math.floor(arr.length / numGroups);
        let remainder = arr.length % numGroups;
        const result = [];
        let start = 0;

        for (let i = 0; i < numGroups; i++) {
            const end = start + perGroup + (remainder > 0 ? 1 : 0);
            result.push(arr.slice(start, end));
            start = end;
            if (remainder > 0) remainder--;
        }

        return result;
    }

    handleIncomingMessage(msg, clientIndex) {
        try {
            if (msg.type !== 'chat') return;

            const number = msg.from.split('@')[0];
            const client = this.clientManager.getClients()[clientIndex];
            const clientInfo = client.getClientInfo();
            const myNumber = clientInfo.wid.user;

            const conversation = this.conversationManager.getConversation(number, clientIndex, myNumber);
            conversation.addMessage('Recibido', msg.body);
            conversation.display();
            logger.info(`Mensaje recibido de ${number} en el cliente ${clientIndex + 1}.`);
        } catch (error) {
            console.error(`Error al procesar el mensaje entrante: ${error.message}`);
            logger.error(`Error al procesar el mensaje entrante: ${error.stack}`);
        }
    }

    async processReply(ids, replyMessage) {
        const validConversations = this.conversationManager.getConversationsByIds(ids);
        if (validConversations.length === 0) {
            console.log('No se encontraron conversaciones válidas para los IDs proporcionados.');
            return;
        }

        this.messageService.sendReply(validConversations, replyMessage);
    }
}

module.exports = Application;
