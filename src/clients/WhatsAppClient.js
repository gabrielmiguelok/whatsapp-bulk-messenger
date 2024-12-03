// src/clients/WhatsAppClient.js

const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const IWhatsAppClient = require('./IWhatsAppClient');
const config = require('../utils/config');
const logger = require('../utils/logger');

class WhatsAppClient extends IWhatsAppClient {
    constructor(index) {
        super();
        this.index = index;
        this.client = new Client({
            qrTimeoutMs: config.qrTimeoutMs,
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox']
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

module.exports = WhatsAppClient;
