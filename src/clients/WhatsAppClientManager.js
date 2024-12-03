// src/clients/WhatsAppClientManager.js

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

module.exports = WhatsAppClientManager;
