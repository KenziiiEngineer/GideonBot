const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un usuario del servidor.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario a expulsar')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón de la expulsión')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async executeSlash(interaction) {
        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'Sin razón';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) return interaction.reply({ content: 'Usuario no encontrado.', ephemeral: true });
        try {
            await member.kick(reason);
            await interaction.reply({ content: `${user.tag} ha sido expulsado.`, ephemeral: true });
        } catch (err) {
            await interaction.reply({ content: 'No se pudo expulsar al usuario.', ephemeral: true });
        }
    },
    // Mantener compatibilidad con prefijo
    name: 'kick',
    description: 'Expulsa a un usuario del servidor.',
    async execute(message, args) {
        if (!message.member.permissions.has('KickMembers')) return message.reply('No tienes permisos para expulsar.');
        const user = message.mentions.users.first();
        if (!user) return message.reply('Menciona a un usuario para expulsar.');
        const member = message.guild.members.cache.get(user.id);
        if (!member) return message.reply('Usuario no encontrado.');
        try {
            await member.kick(args.slice(1).join(' ') || 'Sin razón');
            message.reply(`${user.tag} ha sido expulsado.`);
        } catch (err) {
            message.reply('No se pudo expulsar al usuario.');
        }
    }
};
