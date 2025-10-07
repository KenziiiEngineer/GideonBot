const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketsetup')
        .setDescription('Envía el embed para crear tickets con menú de secciones.')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal donde se enviará el embed de tickets')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async executeSlash(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Sistema de Tickets')
            .setDescription('Selecciona una opción para crear un ticket:\n\n' +
                '🛒 **Compra**\n' +
                '🛠️ **Soporte**\n' +
                '🐞 **Bugs**')
            .setColor(0x5865F2);

        const menu = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Selecciona el motivo de tu ticket')
            .addOptions([
                {
                    label: 'Compra',
                    description: 'Abrir un ticket para compras',
                    value: 'compra',
                    emoji: '🛒',
                },
                {
                    label: 'Soporte',
                    description: 'Abrir un ticket de soporte',
                    value: 'soporte',
                    emoji: '🛠️',
                },
                {
                    label: 'Bugs',
                    description: 'Reportar un bug',
                    value: 'bugs',
                    emoji: '🐞',
                },
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        const canal = interaction.options.getChannel('canal');
        if (canal) {
            await canal.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: `Embed de tickets enviado a ${canal}.`, ephemeral: true });
        } else {
            await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });
        }
    },
    // Si usas prefijo, puedes agregar aquí la versión para prefijo
};
