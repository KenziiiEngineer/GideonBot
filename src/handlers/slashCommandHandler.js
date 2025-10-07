// Handler de slash commands: carga slash commands de subcarpetas por categoría
const fs = require('fs');
const path = require('path');

/**
 * Carga todos los slash commands de las subcarpetas de /commands
 * @param {import('discord.js').Client} client 
 */
module.exports = (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    const categories = fs.readdirSync(commandsPath);
    for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        if (fs.lstatSync(categoryPath).isDirectory()) {
            const commandFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(path.join(categoryPath, file));
                if (command.data) {
                    client.slashCommands.set(command.data.name, command);
                }
            }
        } else if (category.endsWith('.js')) {
            // Comandos sueltos en /commands
            const command = require(path.join(commandsPath, category));
            if (command.data) {
                client.slashCommands.set(command.data.name, command);
            }
        }
    }
};
