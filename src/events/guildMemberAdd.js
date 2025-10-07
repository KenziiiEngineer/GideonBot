const { Events } = require('discord.js');
const { getConfig } = require('../utils/guildConfig');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // Autorole automático
        const config = getConfig(member.guild.id);
        if (config && config.autorole) {
            const role = member.guild.roles.cache.get(config.autorole);
            if (role) {
                try {
                    await member.roles.add(role);
                } catch (err) {
                    console.error('Error al asignar autorole:', err);
                }
            }
        }
        // Mensaje de bienvenida clásico
        const channel = member.guild.systemChannel;
        if (channel) {
            channel.send(`¡Bienvenido/a ${member.user.tag} al servidor!`);
        }
    }
};
