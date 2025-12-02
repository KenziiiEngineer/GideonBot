import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { getGiveaways, saveGiveaways } from "../../systems/giveaways/giveawayManager.js";
import { sendLog } from "../../systems/logs/logManager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("reroll")
    .setDescription("Vuelve a sortear ganadores en un sorteo finalizado.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt =>
      opt.setName("id")
        .setDescription("ID del mensaje del sorteo")
        .setRequired(true)
    ),

  async execute(interaction) {
    const id = interaction.options.getString("id");
    const giveaways = await getGiveaways();

    // Solo sorteos finalizados
    const g = giveaways.find(x => x.messageId === id && x.ended);

    if (!g)
      return interaction.reply({
        content: "❌ Ese sorteo no ha terminado o no existe.",
        ephemeral: true
      });

    // Buscar mensaje
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

    // Participantes reales desde el sistema nuevo
    const participants = g.participants || [];

    if (participants.length === 0)
      return interaction.reply({
        content: "⚠️ No hubo participantes en este sorteo.",
        ephemeral: true
      });

    // Elegir nuevos ganadores
    const pool = [...participants];
    const winners = [];

    for (let i = 0; i < g.winners; i++) {
      if (pool.length === 0) break;
      const randomIndex = Math.floor(Math.random() * pool.length);
      const winnerId = pool.splice(randomIndex, 1)[0];
      winners.push(`<@${winnerId}>`);
    }

    // Embed de reroll
    const embed = new EmbedBuilder()
      .setColor("#FEE75C")
      .setTitle("🔁 Nuevo ganador del sorteo")
      .setDescription(
        `🎁 **${g.prize}**\n` +
        `🏆 Nuevos ganadores: ${winners.join(", ")}`
      )
      .setTimestamp();

    // Enviar anuncio de reroll
    await channel.send({ embeds: [embed] });

    // Log PRO
    await sendLog(interaction.guild, {
      title: "🔁 Reroll de Sorteo",
      fields: [
        { name: "Premio", value: g.prize },
        { name: "Nuevos Ganadores", value: winners.join(", ") },
        { name: "ID del Sorteo", value: g.messageId }
      ]
    });

    await interaction.reply({
      content: "✅ Reroll completado correctamente.",
      ephemeral: true
    });
  }
};
