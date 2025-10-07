const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { getConfig } = require('../../utils/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setmessageautorole')
        .setDescription('Envía un embed con los botones de autoroles configurados')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async executeSlash(interaction) {
        const config = getConfig(interaction.guild.id);
        const autoroles = config.autoroles || [];
        if (autoroles.length === 0) {
            return interaction.reply({ content: 'No hay autoroles configurados. Usa /setautorole primero.', ephemeral: true });
        }
        // Puedes editar el embed aquí:
        const embed = new EmbedBuilder()
            .setTitle('¡Elige tus roles!')
            .setDescription('Haz clic en los botones para obtener/quitar los roles que desees.')
            .setColor(0x00AE86);
        const row = new ActionRowBuilder();
        for (const ar of autoroles) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`autorole_${ar.roleId}`)
                    .setLabel(ar.label)
                    .setStyle(ButtonStyle.Secondary)
            );
        }
        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: 'Mensaje de autoroles enviado.', ephemeral: true });
    }
};
