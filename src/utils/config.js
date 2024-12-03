// src/utils/config.js

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

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
    logger.error(`Error al leer el archivo de configuración: ${error.message}`);
    process.exit(1);
}

module.exports = config;
