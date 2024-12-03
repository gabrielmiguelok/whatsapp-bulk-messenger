// src/ui/UserInterface.js

const inquirer = require('inquirer');

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

module.exports = UserInterface;
