// src/conversations/ConversationManager.js

const Conversation = require('./Conversation');

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

module.exports = ConversationManager;
