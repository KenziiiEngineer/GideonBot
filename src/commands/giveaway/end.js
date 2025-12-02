import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { getGiveaways, saveGiveaways } from "../../systems/giveaways/giveawayManager.js";
import { sendLog } from "../../systems/logs/logManager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("endgiveaway")
    .setDescription("Finaliza un sorteo manualmente.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt =>
      opt.setName("id")
        .setDescription("ID del mensaje del sorteo")
        .setRequired(true)
    ),

  async execute(interaction) {
    const id = interaction.options.getString("id");
    const giveaways = await getGiveaways();
    const g = giveaways.find(x => x.messageId === id);

    if (!g)
      return interaction.reply({
        content: "❌ No se encontró ese sorteo.",
        ephemeral: true
      });

    if (g.ended)
      return interaction.reply({
        content: "⚠️ Este sorteo ya fue finalizado.",
        ephemeral: true
      });

    // Buscar canal y mensaje
    const channel = await interaction.guild.channels.fetch(g.channelId).catch(() => null);
    if (!channel)
      return interaction.reply({
        content: "❌ No se encontró el canal del sorteo.",
        ephemeral: true
      });

    const msg = await channel.messages.fetch(g.messageId).catch(() => null);
    if (!msg)
      return interaction.reply({
        content: "❌ No se encontró el mensaje del sorteo.",
        ephemeral: true
      });

    // PARTICIPANTES desde el sistema nuevo
    const participants = g.participants || [];

    if (participants.length === 0)
      return interaction.reply({
        content: "⚠️ No hubo participantes.",
        ephemeral: true
      });

    // Elegir ganadores
    const pool = [...participants];
    const winners = [];

    for (let i = 0; i < g.winners; i++) {
      if (pool.length === 0) break;
      const randomIndex = Math.floor(Math.random() * pool.length);
      const winnerId = pool.splice(randomIndex, 1)[0];
      winners.push(`<@${winnerId}>`);
    }

    // Embed final
    const embed = new EmbedBuilder()
      .setColor("#57F287")
      .setTitle("🎉 Sorteo finalizado")
      .setDescription(
        `🎁 **${g.prize}**\n` +
        `👥 Participantes: **${participants.length}**\n` +
        `🏆 Ganadores: ${winners.length > 0 ? winners.join(", ") : "Nadie participó"}`
      )
      .setTimestamp();

    await msg.edit({ embeds: [embed], components: [] });

    // Log PRO
    await sendLog(interaction.guild, {
      title: "🎉 Sorteo Finalizado",
      fields: [
        { name: "Premio", value: g.prize },
        { name: "Ganadores", value: winners.join(", ") || "Nadie" },
        { name: "ID Mensaje", value: g.messageId }
      ]
    });

    await interaction.reply({
      content: "✅ El sorteo se finalizó correctamente.",
      ephemeral: true
    });

    // Guardar estado
    g.ended = true;
    await saveGiveaways(giveaways);
  }
};
