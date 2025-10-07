const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const { setConfig, getConfig } = require('../../utils/guildConfig');

module.exports = {
    // Slash command para configurar canal de bienvenida
    data: new SlashCommandBuilder()
        .setName('setwelcome')
        .setDescription('Configura el canal de bienvenida')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal donde se enviarán las bienvenidas')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),
    async executeSlash(interaction) {
        const channel = interaction.options.getChannel('canal');
        setConfig(interaction.guild.id, {
            ...getConfig(interaction.guild.id),
            welcomeChannel: channel.id
        });
        await interaction.reply(`Canal de bienvenida configurado en ${channel}`);
    },
    // Función para enviar el embed de bienvenida
    sendWelcome: async (member) => {
        const config = getConfig(member.guild.id);
        if (!config.welcomeChannel) return;
        const channel = member.guild.channels.cache.get(config.welcomeChannel);
        if (!channel) return;
        const mensaje = '¡Bienvenido/a {user} a nuestro servidor!'.replace('{user}', `<@${member.id}>`);
        const embed = new EmbedBuilder()
            .setTitle('¡Bienvenida!')
            .setDescription(mensaje)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setColor(0x00AE86)
            .setTimestamp();
        channel.send({ embeds: [embed] });
    }
};
