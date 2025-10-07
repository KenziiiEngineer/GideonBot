const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un usuario del servidor.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario a banear')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón del baneo')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async executeSlash(interaction) {
        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'Sin razón';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) return interaction.reply({ content: 'Usuario no encontrado.', ephemeral: true });
        try {
            await member.ban({ reason });
            await interaction.reply({ content: `${user.tag} ha sido baneado.`, ephemeral: true });
        } catch (err) {
            await interaction.reply({ content: 'No se pudo banear al usuario.', ephemeral: true });
        }
    },
    // Mantener compatibilidad con prefijo
    name: 'ban',
    description: 'Banea a un usuario del servidor.',
    async execute(message, args) {
        if (!message.member.permissions.has('BanMembers')) return message.reply('No tienes permisos para banear.');
        const user = message.mentions.users.first();
        if (!user) return message.reply('Menciona a un usuario para banear.');
        const member = message.guild.members.cache.get(user.id);
        if (!member) return message.reply('Usuario no encontrado.');
        try {
            await member.ban({ reason: args.slice(1).join(' ') || 'Sin razón' });
            message.reply(`${user.tag} ha sido baneado.`);
        } catch (err) {
            message.reply('No se pudo banear al usuario.');
        }
    }
};
