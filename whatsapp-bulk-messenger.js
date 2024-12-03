// whatsapp-bulk-messenger

// Importaciones necesarias
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const fs = require('fs');
const inquirer = require('inquirer'); // Usar inquirer directamente
const { createLogger, format, transports } = require('winston');
const path = require('path');

// Configuración del logger con Winston
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new transports.File({ filename: 'application.log' }),
        new transports.Console()
    ]
});

// Lectura de la configuración externa
const configPath = path.resolve('config.json');
let config;

try {
    if (!fs.existsSync(configPath)) {
        throw new Error(`El archivo de configuración ${configPath} no existe.`);
    }
    const configData = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(configData);
} catch (error) {
    console.error(`Error al leer el archivo de configuración: ${error.message}`);
    process.exit(1);
}

/**
 * Interfaz para definir los métodos de un cliente de WhatsApp.
 */
class IWhatsAppClient {
    initialize() {}
    setMessageHandler(handler) {}
    sendMessage(to, message) {}
    getClientInfo() {}
}

/**
 * Clase que representa un cliente de WhatsApp individual.
 * Aplica el Principio de Responsabilidad Única (SRP) al manejar solo la lógica de un cliente.
 */
class WhatsAppClient extends IWhatsAppClient {
    constructor(index) {
        super();
        this.index = index;
        this.client = new Client({
            qrTimeoutMs: config.qrTimeoutMs,
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox']  // Añadido para evitar el problema de sandbox
            }
        });
        this.onMessageReceived = null;
        this.initialize();
    }

    initialize() {
        this.client.on('qr', (qr) => {
            console.clear();
            console.log(`\n[Cliente ${this.index + 1}] Por favor, escanea el código QR:\n`);
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log(`[Cliente ${this.index + 1}] Conectado exitosamente.`);
            logger.info(`Cliente ${this.index + 1} conectado.`);
        });

        this.client.on('message', (msg) => {
            if (msg.type === 'chat' && this.onMessageReceived) {
                this.onMessageReceived(msg, this.index);
            }
        });

        this.client.on('auth_failure', (msg) => {
            console.error(`[Cliente ${this.index + 1}] Fallo de autenticación: ${msg}`);
            logger.error(`Cliente ${this.index + 1} fallo de autenticación: ${msg}`);
        });

        this.client.on('disconnected', (reason) => {
            console.log(`[Cliente ${this.index + 1}] Desconectado: ${reason}`);
            logger.warn(`Cliente ${this.index + 1} desconectado: ${reason}`);
        });

        this.client.initialize().catch(error => {
            console.error(`[Cliente ${this.index + 1}] Error al inicializar: ${error.message}`);
            logger.error(`Cliente ${this.index + 1} error al inicializar: ${error.message}`);
        });
    }

    setMessageHandler(handler) {
        this.onMessageReceived = handler;
    }

    async sendMessage(to, message) {
        try {
            await this.client.sendMessage(to, message);
            logger.info(`Mensaje enviado a ${to} desde el cliente ${this.index + 1}.`);
        } catch (error) {
            console.error(`Error al enviar mensaje a ${to}: ${error.message}`);
            logger.error(`Error al enviar mensaje a ${to} desde el cliente ${this.index + 1}: ${error.message}`);
        }
    }

    getClientInfo() {
        return this.client.info;
    }
}

/**
 * Clase que administra múltiples clientes de WhatsApp.
 * Aplica el Principio de Inversión de Dependencias (DIP) al depender de la abstracción IWhatsAppClient.
 */
class WhatsAppClientManager {
    constructor(clientFactory) {
        this.clients = [];
        this.clientFactory = clientFactory;
    }

    async initializeClients(num) {
        for (let i = 0; i < num; i++) {
            const client = this.clientFactory.createClient(i);
            this.clients.push(client);
            await this.waitForClientReady(client);
        }
    }

    waitForClientReady(client) {
        return new Promise((resolve) => {
            client.client.on('ready', resolve);
        });
    }

    getClients() {
        return this.clients;
    }
}

/**
 * Factoría para crear instancias de WhatsAppClient.
 * Aplica el Principio de Abierto/Cerrado (OCP), permitiendo extender la creación de clientes sin modificar el código existente.
 */
class WhatsAppClientFactory {
    createClient(index) {
        return new WhatsAppClient(index);
    }
}

/**
 * Clase que representa una conversación con un contacto.
 * Aplica el Principio de Responsabilidad Única (SRP).
 */
class Conversation {
    constructor(id, clientIndex, clientNumber, recipientNumber) {
        this.id = id;
        this.clientIndex = clientIndex;
        this.clientNumber = clientNumber;
        this.recipientNumber = recipientNumber;
        this.messages = [];
    }

    addMessage(direction, content) {
        this.messages.push({ direction, content });
    }

    display() {
        console.log(`\n-----------------`);
        console.log(`Conversación ID: ${this.id} (Cuenta: ${this.clientNumber}, Receptora: ${this.recipientNumber})`);
        this.messages.forEach(msg => console.log(`${msg.direction}: ${msg.content}`));
        console.log('-----------------\n');
    }
}

/**
 * Clase que gestiona todas las conversaciones.
 * Aplica el Principio de Responsabilidad Única (SRP).
 */
class ConversationManager {
    constructor() {
        this.conversations = new Map();
        this.counter = 1;
    }

    getConversation(number, clientIndex, clientNumber) {
        if (!this.conversations.has(number)) {
            const convo = new Conversation(this.counter++, clientIndex, clientNumber, number);
            this.conversations.set(number, convo);
        }
        return this.conversations.get(number);
    }

    getConversationsByIds(ids) {
        const convoArray = Array.from(this.conversations.values());
        return ids.map(id => convoArray.find(convo => convo.id === id)).filter(convo => convo);
    }

    getAllConversations() {
        return Array.from(this.conversations.values());
    }
}

/**
 * Interfaz para el servicio de mensajería.
 */
class IMessageService {
    sendMessages(numbersPerClient, message) {}
    sendReply(conversations, replyMessage) {}
}

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

/**
 * Clase que maneja las interacciones con el usuario.
 * Aplica el Principio de Responsabilidad Única (SRP).
 */
class UserInterface {
    constructor(conversationManager, onReplyHandler) {
        this.conversationManager = conversationManager;
        this.onReplyHandler = onReplyHandler;
    }

    async showMainMenu() {
        while (true) {
            const { action } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'Selecciona una acción:',
                    choices: [
                        { name: 'Enviar mensaje de respuesta', value: 'send_reply' },
                        { name: 'Salir', value: 'exit' }
                    ]
                }
            ]);

            if (action === 'send_reply') {
                await this.handleReply();
            } else if (action === 'exit') {
                console.log('Saliendo de la aplicación...');
                process.exit(0);
            }
        }
    }

    async handleReply() {
        const conversations = this.conversationManager.getAllConversations();
        if (conversations.length === 0) {
            console.log('No hay conversaciones disponibles para responder.');
            return;
        }

        const choices = conversations.map(convo => ({
            name: `ID ${convo.id} - Cuenta: ${convo.clientNumber}, Receptora: ${convo.recipientNumber}`,
            value: convo.id
        }));

        const { selectedIds } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selectedIds',
                message: 'Selecciona las conversaciones a las que deseas enviar un segundo mensaje:',
                choices: choices,
                validate: (input) => input.length > 0 ? true : 'Debes seleccionar al menos una conversación.'
            }
        ]);

        const { replyMessage } = await inquirer.prompt([
            {
                type: 'input',
                name: 'replyMessage',
                message: '¿Cuál es el mensaje que deseas enviar en respuesta?',
                validate: (input) => input.trim() !== '' ? true : 'El mensaje no puede estar vacío.'
            }
        ]);

        if (this.onReplyHandler) {
            this.onReplyHandler(selectedIds, replyMessage);
        }
    }
}

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

// Inicio de la aplicación
const app = new Application();
app.run();
