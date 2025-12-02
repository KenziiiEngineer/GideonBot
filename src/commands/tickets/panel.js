import {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  PermissionsBitField
} from "discord.js";

import config from "../../config.json" assert { type: "json" };

export default {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Crea el panel de tickets con categorías."),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "❌ No tienes permisos para usar este comando.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(config.bot.color || "#2b2d31")
      .setTitle("🎟️ Centro de Soporte | Gideon Studio")
      .setDescription(
        "Selecciona la categoría de tu ticket para recibir atención del equipo.\n\n" +
        "🛠 **Soporte General** — Problemas técnicos y dudas.\n" +
        "🛒 **Compras / Pagos** — Comprobantes y problemas con servicios.\n" +
        "🐞 **Reporte de Bugs** — Fallos del bot, errores técnicos.\n" +
        "🦑 **CCG2** — Ayuda exclusiva del evento.\n"
      )
      .setFooter({
        text: config.bot.embedFooter,
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_category")
      .setPlaceholder("Selecciona el tipo de ticket")
      .addOptions([
        {
          label: "Soporte General",
          value: "soporte",
          emoji: "🛠"
        },
        {
          label: "Compras / Pagos",
          value: "compras",
          emoji: "🛒"
        },
        {
          label: "Reporte de Bug",
          value: "bug",
          emoji: "🐞"
        },
        {
          label: "CCG2 — Jugadores",
          value: "ccg2",
          emoji: "🦑"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({ content: "✅ Panel de tickets enviado.", ephemeral: true });
    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });
  },
};
