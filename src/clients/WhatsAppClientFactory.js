// src/clients/WhatsAppClientFactory.js

const WhatsAppClient = require('./WhatsAppClient');

/**
 * Factoría para crear instancias de WhatsAppClient.
 * Aplica el Principio de Abierto/Cerrado (OCP), permitiendo extender la creación de clientes sin modificar el código existente.
 */
class WhatsAppClientFactory {
    createClient(index) {
        return new WhatsAppClient(index);
    }
}

module.exports = WhatsAppClientFactory;
