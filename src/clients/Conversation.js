// src/conversations/Conversation.js

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

module.exports = Conversation;
