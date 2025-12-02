import { EmbedBuilder } from "discord.js";
import config from "../../config.json" assert { type: "json" };

export async function sendLog(guild, type, description, color = "#2F3136", extraFields = []) {
  try {
    const canalLogs = guild.channels.cache.get(config.logs.canalGeneral);
    if (!canalLogs) return;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`🪄 Log: ${type}`)
      .setDescription(description)
      .addFields(extraFields)
      .setTimestamp()
      .setFooter({ text: "Sistema de Logs | Gideon Studio" });

    await canalLogs.send({ embeds: [embed] });
  } catch (err) {
    console.error("Error enviando log:", err);
  }
}
