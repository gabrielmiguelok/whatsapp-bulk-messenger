# WhatsApp Bulk Messenger

**Automatiza el envío de mensajes masivos a través de WhatsApp usando múltiples cuentas y administra conversaciones de forma eficiente.**

Este proyecto te permite enviar mensajes automatizados a múltiples números de WhatsApp usando `whatsapp-web.js`, gestionando múltiples cuentas simultáneamente y proporcionando una interfaz interactiva para responder a mensajes.

---

## Características

🚀 **Envío masivo de mensajes**: Envía mensajes a múltiples números de WhatsApp con facilidad.

🤖 **Múltiples cuentas**: Soporta la gestión de varias cuentas de WhatsApp en paralelo.

📝 **Gestión de conversaciones**: Registra y muestra todas las conversaciones, tanto enviadas como recibidas.

⏸️ **Pausas automáticas**: Configura pausas automáticas después de un número determinado de mensajes para evitar bloqueos.

📜 **Logs detallados**: Todo el proceso se registra con la librería `winston`, asegurando trazabilidad y diagnóstico.

---

## Requisitos

### Software necesario

- **Node.js** (v14 o superior) – [Descargar Node.js](https://nodejs.org/)
- **npm** (v6 o superior) – Instálalo automáticamente con Node.js

### Dependencias

Este proyecto requiere las siguientes dependencias:

- [whatsapp-web.js](https://github.com/mukulhase/WebWhatsapp-Wrapper) para interactuar con WhatsApp Web.
- [winston](https://github.com/winstonjs/winston) para registrar logs.
- [inquirer](https://github.com/SBoudrias/Inquirer.js) para la interfaz de usuario interactiva en consola.
- [qrcode-terminal](https://github.com/gtanner/qrcode-terminal) para generar códigos QR en la terminal.

---

## Instalación

Sigue estos sencillos pasos para instalar y ejecutar el proyecto:

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/gabrielmiguelok/whatsapp-bulk-messenger.git
   cd whatsapp-bulk-messenger
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Configura el archivo `config.json`**:
   Abre el archivo `config.json` y ajusta los valores según tus necesidades. Ejemplo de configuración:

   ```json
   {
     "numAccounts": 3,
     "numbers": [
       "5492364655702",
       "5492364655703",
       "5492364655704",
       "5492364655705",
       "5492364655706",
       "5492364655707"
     ],
     "message": "Hola, soy un mensaje automatizado.",
     "qrTimeoutMs": 60000,
     "delayBetweenMessagesMs": 1000,
     "messagesBeforePause": 5,
     "pauseDurationMinutes": 1
   }
   ```

   ### Configuración de `config.json`
   - **`numAccounts`**: Número de cuentas de WhatsApp que deseas gestionar.
   - **`numbers`**: Lista de números a los que se enviarán los mensajes.
   - **`message`**: El mensaje que se enviará a cada número.
   - **`qrTimeoutMs`**: Tiempo de espera en milisegundos para escanear el código QR.
   - **`delayBetweenMessagesMs`**: Tiempo de espera en milisegundos entre el envío de mensajes.
   - **`messagesBeforePause`**: Número de mensajes enviados antes de hacer una pausa.
   - **`pauseDurationMinutes`**: Duración de la pausa en minutos.

4. **Ejecuta el script**:
   ```bash
   npm start
   ```

   **Nota**: Durante la ejecución, se generarán códigos QR para cada cuenta. Escanéelos con la aplicación WhatsApp en tu teléfono para autenticar las cuentas.

---

## Uso

Una vez que el script haya iniciado, comenzará a enviar mensajes a los números configurados en el archivo `config.json`. Durante el proceso, verás los siguientes comportamientos:

### Enviar Mensajes

- Los mensajes se enviarán de forma secuencial a cada número configurado.
- Después de enviar el número configurado de mensajes, el script hará una pausa para evitar el bloqueo de la cuenta de WhatsApp.
- El intervalo entre mensajes está determinado por el valor de `delayBetweenMessagesMs`.

### Interacción con el Usuario

El script también permite interactuar con las conversaciones utilizando una interfaz de línea de comandos:

1. **Responder a los mensajes**: Una vez que un mensaje es recibido, puedes responder a las conversaciones directamente desde la interfaz interactiva.
2. **Seleccionar conversaciones**: Elige a qué conversaciones deseas responder y qué mensaje enviar.

### Logs

Durante todo el proceso, los logs se registrarán en el archivo `application.log` y se imprimirán en consola, lo que facilita la depuración y el seguimiento de eventos importantes.

---

## Estructura del Proyecto

El proyecto sigue una estructura modular, donde cada componente tiene una única responsabilidad y puede ser extendido sin modificar el código base:

```
whatsapp-bulk-messenger/
├── node_modules/              # Dependencias instaladas
├── src/                       # Código fuente
│   ├── index.js               # Script principal
│   ├── WhatsAppClient.js      # Cliente de WhatsApp
│   ├── WhatsAppClientManager.js  # Gestor de cuentas de WhatsApp
│   ├── MessageService.js      # Servicio de envío de mensajes
│   ├── ConversationManager.js # Gestor de conversaciones
│   └── UserInterface.js       # Interfaz de usuario interactiva
├── config.json                # Configuración del proyecto
├── package.json               # Gestión de dependencias
├── application.log            # Logs detallados
├── README.md                  # Documentación
```

---

## Clases Principales

### `WhatsAppClient`

Esta clase representa una cuenta individual de WhatsApp. Se encarga de gestionar la conexión con la API de WhatsApp Web, manejar el envío y la recepción de mensajes, y mostrar el código QR necesario para la autenticación.

**Responsabilidad**: Conexión y manejo de mensajes para una cuenta específica.

---

### `WhatsAppClientManager`

Gestiona múltiples instancias de `WhatsAppClient`, coordinando las conexiones y asegurando que todas las cuentas estén listas para enviar mensajes.

**Responsabilidad**: Administración de las cuentas de WhatsApp.

---

### `MessageService`

Es la clase encargada del envío de mensajes masivos. Organiza el envío de mensajes en lotes y maneja las pausas entre ellos.

**Responsabilidad**: Enviar mensajes de manera eficiente y gestionada.

---

### `ConversationManager`

Administra las conversaciones, manteniendo un registro de todos los mensajes enviados y recibidos. Permite acceder a las conversaciones y mostrar sus detalles.

**Responsabilidad**: Gestión y almacenamiento de conversaciones.

---

### `UserInterface`

Proporciona la interfaz interactiva para la gestión de respuestas. Permite al usuario seleccionar a qué conversaciones responder y qué mensaje enviar.

**Responsabilidad**: Interacción con el usuario a través de la línea de comandos.

---

## Principios SOLID Aplicados

Este proyecto está diseñado para ser modular, flexible y fácil de mantener. Aquí se aplican los siguientes principios:

1. **SRP (Principio de Responsabilidad Única)**: Cada clase tiene una responsabilidad clara y única. Ejemplo: `WhatsAppClient` solo maneja la conexión de una cuenta, mientras que `MessageService` se enfoca en el envío de mensajes.

2. **OCP (Principio de Abierto/Cerrado)**: El sistema está preparado para ser extendido sin modificar el código base. Nuevas funcionalidades pueden ser agregadas mediante la creación de nuevas clases que sigan las interfaces existentes.

3. **LSP (Principio de Sustitución de Liskov)**: Las subclases pueden ser sustituidas por las clases base sin alterar el comportamiento del sistema.

4. **ISP (Principio de Segregación de Interfaces)**: Las interfaces están diseñadas para ser específicas y limitadas, evitando que las clases tengan métodos que no necesiten.

5. **DIP (Principio de Inversión de Dependencias)**: El código depende de interfaces abstractas en lugar de implementaciones concretas, lo que facilita la extensión y mejora la flexibilidad.

---

## Contribuciones

Si deseas contribuir a este proyecto, sigue estos pasos:

1. Haz un **fork** del repositorio.
2. Crea una **nueva rama** para tu funcionalidad.
3. Realiza los cambios y asegúrate de que todo esté funcionando correctamente.
4. Abre un **pull request** con una descripción detallada de los cambios.

Recuerda que las contribuciones son bienvenidas y siempre buscamos mejorar la experiencia del usuario.

---

## Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

## Contacto

Si tienes alguna pregunta o sugerencia, no dudes en abrir un **issue** en el repositorio o contactar al autor:

- GitHub: [gabrielmiguelok](https://github.com/gabrielmiguelok)
- Correo electrónico: [ceo@synara.ar](mailto:ceo@synara.ar)
- Linkedin: [gabrielmiguelok](https://www.linkedin.com/in/gabrielmiguelok/)


---

