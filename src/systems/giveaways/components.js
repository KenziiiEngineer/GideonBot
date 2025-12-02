// 📌 components.js
import { EmbedBuilder } from "discord.js";
import { getGiveaways, saveGiveaways } from "./giveawayManager.js";
import { sendLog } from "../logs/logManager.js";

const STAFF_ID = "471868961017954306";

export async function handleGiveawayButton(interaction) {
  const giveaways = await getGiveaways();

  let giveaway;

  // Botón desde DM: contact_staff_<messageId>
  if (interaction.customId.startsWith("contact_staff_")) {
    const messageId = interaction.customId.substring("contact_staff_".length);
    giveaway = giveaways.find(g => g.messageId === messageId);
  } else {
    giveaway = giveaways.find(g => g.messageId === interaction.message?.id);
  }

  if (!giveaway) {
    return interaction.reply({ content: "❌ Este sorteo ya no existe.", ephemeral: true });
  }

  const id = interaction.customId;

  // -------------------------
  // 🎉 Participar en sorteo
  // -------------------------
  if (id === "join_giveaway") {
    if (giveaway.ended)
      return interaction.reply({ content: "❌ Este sorteo ya terminó.", ephemeral: true });

    if (giveaway.participants.includes(interaction.user.id))
      return interaction.reply({ content: "⚠️ Ya estás participando.", ephemeral: true });

    giveaway.participants.push(interaction.user.id);
    await saveGiveaways(giveaways);

    return interaction.reply({ content: "🎉 ¡Te uniste al sorteo!", ephemeral: true });
  }

  // -------------------------
  // 👀 Ver participantes
  // -------------------------
  if (id === "view_giveaway") {
    const list = giveaway.participants.slice(0, 50).map(id => `<@${id}>`).join(", ");
    return interaction.reply({
      content: `👥 **Participantes (${giveaway.participants.length})**:\n${list || "Nadie aún."}`,
      ephemeral: true,
    });
  }

  // -------------------------
  // 🔁 Reroll (solo staff)
  // -------------------------
  if (id === "reroll_giveaway") {
    if (!interaction.member?.permissions.has("Administrator"))
      return interaction.reply({ content: "❌ No tienes permisos.", ephemeral: true });

    if (!giveaway.ended)
      return interaction.reply({ content: "⚠️ El sorteo aún no finaliza.", ephemeral: true });

    const valid = [...giveaway.participants];
    if (!valid.length)
      return interaction.reply({ content: "⚠️ No hay participantes.", ephemeral: true });

    const winners = [];
    for (let i = 0; i < giveaway.winners && valid.length > 0; i++) {
      const r = valid.splice(Math.floor(Math.random() * valid.length), 1)[0];
      winners.push(`<@${r}>`);
    }

    await interaction.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#FEE75C")
          .setTitle("🔁 Nuevo Reroll")
          .setDescription(`🎁 **${giveaway.prize}**\n🏆 Nuevos ganadores: ${winners.join(", ")}`)
      ]
    });

    await sendLog(
      interaction.guild,
      "Nuevo Reroll",
      `🎁 **${giveaway.prize}** — Ganadores: ${winners.join(", ")}`
    );

    return interaction.reply({
      content: "✅ Reroll completado.",
      ephemeral: true
    });
  }

  // -------------------------
  // 🎁 Reclamar premio (desde DM)
  // -------------------------
  if (id.startsWith("contact_staff_")) {
    return interaction.reply({
      content: `🎁 Para reclamar tu premio, envía un mensaje a **<@${STAFF_ID}>** con evidencia.`,
      ephemeral: true,
    });
  }
}
