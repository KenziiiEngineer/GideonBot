const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Elimina mensajes del canal.')
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Cantidad de mensajes a eliminar (1-100)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async executeSlash(interaction) {
        const amount = interaction.options.getInteger('cantidad');
        if (amount < 1 || amount > 100) return interaction.reply({ content: 'Debes indicar un número entre 1 y 100.', ephemeral: true });
        await interaction.channel.bulkDelete(amount, true);
        await interaction.reply({ content: `Se han eliminado ${amount} mensajes.`, ephemeral: true });
    },
    // Mantener compatibilidad con prefijo
    name: 'clear',
    description: 'Elimina mensajes del canal.',
    async execute(message, args) {
        if (!message.member.permissions.has('ManageMessages')) return message.reply('No tienes permisos para eliminar mensajes.');
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) return message.reply('Debes indicar un número entre 1 y 100.');
        await message.channel.bulkDelete(amount, true);
        message.channel.send(`Se han eliminado ${amount} mensajes.`);
    }
};
