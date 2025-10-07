const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('Configura el rol automático para nuevos miembros.')
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Rol a asignar automáticamente')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async executeSlash(interaction) {
        const role = interaction.options.getRole('rol');
        // Aquí iría la lógica para guardar el rol en una base de datos o archivo
        interaction.reply(`Funcionalidad de autorole configurada para el rol ${role}. (demo)`);
    },
    // Mantener compatibilidad con prefijo
    name: 'autorole',
    description: 'Configura el rol automático para nuevos miembros.',
    async execute(message, args) {
        // Aquí iría la lógica para guardar el rol en una base de datos o archivo
        message.reply('Funcionalidad de autorole configurada (demo).');
    }
};
