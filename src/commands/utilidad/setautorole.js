const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getConfig, setConfig } = require('../../utils/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setautorole')
        .setDescription('Agrega un rol y un botón para autoroles')
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Rol que se asignará al hacer clic')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nombre_boton')
                .setDescription('Texto que aparecerá en el botón')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async executeSlash(interaction) {
        const role = interaction.options.getRole('rol');
        const nombreBoton = interaction.options.getString('nombre_boton');
        const config = getConfig(interaction.guild.id);
        const autoroles = config.autoroles || [];
        // Evitar duplicados por rol
        if (autoroles.some(r => r.roleId === role.id)) {
            return interaction.reply({ content: 'Ese rol ya está configurado como autorol.', ephemeral: true });
        }
        autoroles.push({ roleId: role.id, label: nombreBoton });
        setConfig(interaction.guild.id, { ...config, autoroles });
        await interaction.reply({ content: `Autorol añadido: ${role} con botón "${nombreBoton}"`, ephemeral: true });
    }
};
