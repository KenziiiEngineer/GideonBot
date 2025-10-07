const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getConfig, setConfig } = require('../../utils/guildConfig');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('setverificar')
        .setDescription('Configura uno o más roles de verificación para el botón.')
        .addRoleOption(option =>
            option.setName('rol1')
                .setDescription('Primer rol de verificación')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rol2')
                .setDescription('Segundo rol de verificación (opcional)')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('rol3')
                .setDescription('Tercer rol de verificación (opcional)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async executeSlash(interaction) {
        // Permitir hasta 3 roles (puedes aumentar este número si lo deseas)
        const roles = [];
        for (let i = 1; i <= 3; i++) {
            const role = interaction.options.getRole(`rol${i}`);
            if (role) roles.push(role.id);
        }
        if (roles.length === 0) {
            return interaction.reply({ content: 'Debes seleccionar al menos un rol.', ephemeral: true });
        }
        setConfig(interaction.guild.id, {
            ...getConfig(interaction.guild.id),
            verificarRoles: roles
        });
        await interaction.reply({ content: `Roles de verificación guardados: ${roles.map(r => `<@&${r}>`).join(', ')}`, ephemeral: true });
    },
    // Mantener compatibilidad con prefijo
    name: 'setverificar',
    description: 'Configura uno o más roles de verificación para el botón.',
    async execute(message, args) {
        if (!message.member.permissions.has('Administrator')) return message.reply('Solo administradores pueden usar este comando.');
        if (!args.length) return message.reply('Debes mencionar al menos un rol. Ejemplo: !setverificar @Rol1 @Rol2');
        const roles = [];
        for (const mention of args) {
            const roleId = mention.match(/<@&([0-9]+)>/);
            if (roleId) {
                const role = message.guild.roles.cache.get(roleId[1]);
                if (role) roles.push(role.id);
            }
        }
        if (roles.length === 0) return message.reply('No se detectaron roles válidos.');
        setConfig(message.guild.id, {
            ...getConfig(message.guild.id),
            verificarRoles: roles
        });
        message.reply(`Roles de verificación guardados: ${roles.map(r => `<@&${r}>`).join(', ')}`);
    }
};
