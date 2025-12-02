// 📌 giveawayManager.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "giveaways.json");

// =====================================
// 📌 LEER GIVEAWAYS
// =====================================
export async function getGiveaways() {
  try {
    if (!fs.existsSync(filePath)) {
      await fs.promises.writeFile(filePath, JSON.stringify([]));
      return [];
    }

    const data = await fs.promises.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("[GIVEAWAYS] Error leyendo archivo:", err);
    return [];
  }
}

// =====================================
// 📌 GUARDAR GIVEAWAYS
// =====================================
export async function saveGiveaways(giveaways) {
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(giveaways, null, 2));
  } catch (err) {
    console.error("[GIVEAWAYS] Error guardando archivo:", err);
  }
}

// =====================================
// 📌 AGREGAR PARTICIPANTE
// =====================================
export async function addParticipant(messageId, userId) {
  const giveaways = await getGiveaways();
  const g = giveaways.find(x => x.messageId === messageId);

  if (!g) return false;
  if (!g.participants.includes(userId)) {
    g.participants.push(userId);
    await saveGiveaways(giveaways);
  }
  return true;
}

// =====================================
// 📌 REMOVER PARTICIPANTE
// =====================================
export async function removeParticipant(messageId, userId) {
  const giveaways = await getGiveaways();
  const g = giveaways.find(x => x.messageId === messageId);
  if (!g) return false;

  g.participants = g.participants.filter(x => x !== userId);
  await saveGiveaways(giveaways);
  return true;
}

// =====================================
// 📌 FUNCIÓN startGiveaway()
// =====================================
export async function startGiveaway(interaction) {
  const duracion = interaction.options.getString("duracion");
  const premio = interaction.options.getString("premio");
  const ganadores = interaction.options.getInteger("ganadores");

  const timeRegex = /^(\d+)(s|m|h|d)$/;
  const match = duracion.match(timeRegex);

  if (!match) {
    return interaction.reply({
      content: "❌ Formato inválido. Usa 10m, 1h, 2d...",
      ephemeral: true
    });
  }

  const amount = parseInt(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000
  };

  const endTime = Date.now() + amount * multipliers[unit];

  const embed = new EmbedBuilder()
    .setTitle("🎉 Nuevo Sorteo Iniciado")
    .setDescription(
      `🎁 **Premio:** ${premio}\n` +
      `👥 **Ganadores:** ${ganadores}\n` +
      `⏳ Finaliza: <t:${Math.floor(endTime / 1000)}:R>\n\n` +
      `Presiona el botón para participar.`
    )
    .setColor("#2b2d31");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("join_giveaway")
      .setLabel("🎉 Participar")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("leave_giveaway")
      .setLabel("❌ Salir")
      .setStyle(ButtonStyle.Danger)
  );

  const msg = await interaction.channel.send({
    embeds: [embed],
    components: [row]
  });

  const giveaways = await getGiveaways();

  giveaways.push({
    guildId: interaction.guild.id,
    channelId: msg.channel.id,
    messageId: msg.id,
    prize: premio,
    winners: ganadores,
    endTime,
    participants: [],
    ended: false
  });

  await saveGiveaways(giveaways);

  return interaction.reply({
    content: "🎉 ¡Sorteo creado exitosamente!",
    ephemeral: true
  });
}
