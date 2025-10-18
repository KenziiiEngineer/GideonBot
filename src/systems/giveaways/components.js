import { EmbedBuilder } from "discord.js";
import { getGiveaways, saveGiveaways } from "./giveawayManager.js";
import { sendLog } from "../logs/logManager.js";

// ⚠️ Cambia este ID por el tuyo o del encargado de premios
const STAFF_ID = "123456789012345678";

export async function handleGiveawayButton(interaction) {
  const giveaways = await getGiveaways();
  const g = giveaways.find(x => x.messageId === interaction.message.id);
  if (!g) return interaction.reply({ content: "❌ Este sorteo ya no existe.", ephemeral: true });

  switch (interaction.customId) {
    case "join_giveaway": {
      if (g.ended) return interaction.reply({ content: "❌ El sorteo ya finalizó.", ephemeral: true });
      if (g.participants.includes(interaction.user.id))
        return interaction.reply({ content: "⚠️ Ya estás participando.", ephemeral: true });

      g.participants.push(interaction.user.id);
      await saveGiveaways(giveaways);
      return interaction.reply({ content: "🎉 ¡Te uniste al sorteo!", ephemeral: true });
    }

    case "view_giveaway": {
      if (g.participants.length === 0)
        return interaction.reply({ content: "👀 Nadie se ha unido aún.", ephemeral: true });
      const list = g.participants.slice(0, 30).map(id => `<@${id}>`).join(", ");
      return interaction.reply({
        content: `👥 **Participantes (${g.participants.length})**:\n${list}`,
        ephemeral: true
      });
    }

    case "reroll_giveaway": {
      if (!g.ended)
        return interaction.reply({ content: "❌ Este sorteo sigue activo.", ephemeral: true });

      const valid = [...g.participants];
      if (valid.length === 0)
        return interaction.reply({ content: "⚠️ No hubo participantes.", ephemeral: true });

      const winners = [];
      for (let i = 0; i < g.winners && valid.length > 0; i++) {
        const random = valid.splice(Math.floor(Math.random() * valid.length), 1)[0];
        winners.push(`<@${random}>`);
      }

      const embed = new EmbedBuilder()
        .setColor("#FEE75C")
        .setTitle("🔁 Nuevo Reroll")
        .setDescription(`🎁 **${g.prize}**\n🏆 Nuevos ganadores: ${winners.join(", ")}`)
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });
      await sendLog(interaction.guild, "Reroll de Sorteo", `🎁 **${g.prize}** — Nuevos ganadores: ${winners.join(", ")}`);
      return interaction.reply({ content: "✅ Reroll completado.", ephemeral: true });
    }

    // 🧾 NUEVO: botón "Reclamar premio"
    default:
      if (interaction.customId.startsWith("contact_staff_")) {
        return interaction.reply({
          content: `💬 Para reclamar tu premio, mándale un mensaje directo a **<@${471868961017954306}>** con la evidencia o tus datos del sorteo.`,
          ephemeral: true
        });
      }
  }
}
