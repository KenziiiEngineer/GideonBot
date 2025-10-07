const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const colorMap = {
    blanco: 0xffffff,
    white: 0xffffff,
    negro: 0x000000,
    black: 0x000000,
    rojo: 0xff0000,
    red: 0xff0000,
    verde: 0x00ff00,
    green: 0x00ff00,
    azul: 0x0000ff,
    blue: 0x0000ff,
    amarillo: 0xffff00,
    yellow: 0xffff00,
    aqua: 0x00ffff,
    cyan: 0x00ffff,
    morado: 0x800080,
    purple: 0x800080,
    naranja: 0xffa500,
    orange: 0xffa500,
    rosa: 0xff69b4,
    pink: 0xff69b4
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anunciar')
        .setDescription('Envía un anuncio en un embed personalizado')
        .addStringOption(option =>
            option.setName('titulo')
                .setDescription('Título del embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Color del embed (ej: blanco, verde, aqua, rojo, etc.)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('contenido')
                .setDescription('Contenido del anuncio')
                .setRequired(true)),
    async executeSlash(interaction) {
        const titulo = interaction.options.getString('titulo');
        const colorName = interaction.options.getString('color').toLowerCase();
        const contenido = interaction.options.getString('contenido');
        const color = colorMap[colorName];
        if (!color) {
            return interaction.reply({ content: 'Color inválido. Usa: blanco, negro, rojo, verde, azul, amarillo, aqua, morado, naranja, rosa.', ephemeral: true });
        }
        await interaction.reply({ content: 'Anuncio enviado.', ephemeral: true });
        const embed = new EmbedBuilder()
            .setTitle(titulo)
            .setDescription(contenido)
            .setColor(color);
        await interaction.channel.send({ embeds: [embed] });
    }
};
