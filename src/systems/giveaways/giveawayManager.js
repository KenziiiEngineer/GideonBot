import fs from "fs-extra";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import ms from "ms";
import { sendLog } from "../logs/logManager.js";

const path = "./src/data/giveaways.json";

export async function getGiveaways() {
  return await fs.readJson(path).catch(() => []);
}

export async function saveGiveaways(data) {
  await fs.writeJson(path, data, { spaces: 2 });
}

export async function startGiveaway(interaction) {
  const duration = interaction.options.getString("duracion");
  const prize = interaction.options.getString("premio");
  const winners = interaction.options.getInteger("ganadores");

  const time = ms(duration);
  if (!time) return interaction.reply({ content: "❌ Duración inválida. Ejemplo: `1h`, `30m`, `2d`.", ephemeral: true });

  const endTime = Date.now() + time;

  const embed = new EmbedBuilder()
    .setColor("#FEE75C")
    .setTitle("🎉 **¡SORTEO ACTIVO!**")
    .setDescription(`🎁 **Premio:** ${prize}\n🏆 **Ganadores:** ${winners}\n⏰ Termina en <t:${Math.floor(endTime / 1000)}:R>`)
    .setFooter({ text: "Presiona el botón para participar 🎉" })
    .setTimestamp(endTime);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("join_giveaway").setLabel("🎉 Participar").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("view_giveaway").setLabel("👀 Ver participantes").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("reroll_giveaway").setLabel("🔁 Reroll").setStyle(ButtonStyle.Danger)
  );

  const message = await interaction.channel.send({ embeds: [embed], components: [row] });

  const giveaways = await getGiveaways();
  giveaways.push({
    messageId: message.id,
    channelId: message.channel.id,
    guildId: message.guild.id,
    prize,
    winners,
    endTime,
    participants: [],
    ended: false
  });
  await saveGiveaways(giveaways);

  await sendLog(interaction.guild, "Nuevo Sorteo", `🎁 **${prize}** creado por ${interaction.user.tag}`);
  await interaction.reply({ content: "✅ Sorteo creado exitosamente.", ephemeral: true });
}
