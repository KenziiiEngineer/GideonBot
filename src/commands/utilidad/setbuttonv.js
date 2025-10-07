const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { setConfig, getConfig } = require('../../utils/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setbuttonv')
        .setDescription('Envía un embed con botón de verificación y mensaje editable.')
        .addStringOption(option =>
            option.setName('mensaje')
                .setDescription('Mensaje a mostrar en el embed')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async executeSlash(interaction) {
        const texto = interaction.options.getString('mensaje') || 'Haz clic en el botón para verificarte y obtener acceso al servidor.';
        setConfig(interaction.guild.id, {
            ...getConfig(interaction.guild.id),
            verificarMensaje: texto
        });
        const embed = new EmbedBuilder()
            .setTitle('Verificación')
            .setDescription(texto)
            .setColor(0x00AE86);
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('verificar_btn')
                .setLabel('Verificarme')
                .setStyle(ButtonStyle.Success)
        );
        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: 'Mensaje de verificación enviado.', ephemeral: true });
    },
    // Mantener compatibilidad con prefijo
    name: 'setbuttonv',
    description: 'Envía un embed con botón de verificación y mensaje editable.',
    async execute(message, args) {
        if (!message.member.permissions.has('Administrator')) return message.reply('Solo administradores pueden usar este comando.');
        const texto = args.join(' ') || 'Haz clic en el botón para verificarte y obtener acceso al servidor.';
        setConfig(message.guild.id, {
            ...getConfig(message.guild.id),
            verificarMensaje: texto
        });
        const embed = new EmbedBuilder()
            .setTitle('Verificación')
            .setDescription(texto)
            .setColor(0x00AE86);
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('verificar_btn')
                .setLabel('Verificarme')
                .setStyle(ButtonStyle.Success)
        );
        await message.channel.send({ embeds: [embed], components: [row] });
        message.reply('Mensaje de verificación enviado.');
    }
};
