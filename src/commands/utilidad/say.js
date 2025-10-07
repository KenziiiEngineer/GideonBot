const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('El bot repite el mensaje que escribas')
        .addStringOption(option =>
            option.setName('mensaje')
                .setDescription('Mensaje a enviar')
                .setRequired(true)),
    async executeSlash(interaction) {
        const mensaje = interaction.options.getString('mensaje');
        await interaction.channel.send(mensaje);
        await interaction.reply({ content: 'Mensaje enviado.', ephemeral: true });
    }
};
