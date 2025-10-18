import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Crea el panel de tickets en el canal actual."),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "❌ No tienes permisos para usar este comando.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("🎟️ Soporte de Tickets")
      .setDescription(
        "Si necesitas ayuda, presiona el botón de abajo para **abrir un ticket**.\n\n" +
        "🧾 Nuestro equipo te responderá lo antes posible."
      )
      .setFooter({ text: "Sistema de Tickets | Gideon Studio", iconURL: interaction.client.user.displayAvatarURL() });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("create_ticket")
        .setLabel("Abrir Ticket")
        .setEmoji("📩")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ content: "✅ Panel de tickets enviado.", ephemeral: true });
    await interaction.channel.send({ embeds: [embed], components: [row] });
  },
};
