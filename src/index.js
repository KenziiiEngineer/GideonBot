// Punto de entrada principal de GideonBot
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { logWithTime } = require('./utils/logger');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.commands = new Collection();
client.slashCommands = new Collection();

// Cargar handlers de comandos y eventos
['commandHandler', 'eventHandler', 'slashCommandHandler'].forEach(handler => {
    try {
        require(`./handlers/${handler}`)(client);
        logWithTime(`Handler ${handler} cargado correctamente.`);
    } catch (err) {
        logWithTime(`Error cargando handler ${handler}: ${err.message}`);
    }
});

client.login(process.env.TOKEN)
    .then(() => logWithTime('Bot iniciado correctamente.'))
    .catch(err => logWithTime('Error al iniciar el bot: ' + err.message));
