import fs from "fs-extra";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("topsugerencias")
    .setDescription("📊 Muestra las sugerencias más votadas del servidor."),

  async execute(interaction) {
    const dataPath = "src/data/sugerencias.json";
    if (!fs.existsSync(dataPath)) {
      return interaction.reply({ content: "⚠️ No hay sugerencias registradas aún.", ephemeral: true });
    }

    const config = await fs.readJson(dataPath);
    const guildVotes = config.votes?.[interaction.guild.id];
    if (!guildVotes || Object.keys(guildVotes).length === 0) {
      return interaction.reply({ content: "⚠️ No hay sugerencias registradas en este servidor.", ephemeral: true });
    }

    // Convertimos las sugerencias en array y ordenamos
    const sorted = Object.entries(guildVotes)
      .map(([msgId, sug]) => ({
        ...sug,
        msgId,
        score: (sug.upvotes?.length || 0) - (sug.downvotes?.length || 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // top 10

    const embed = new EmbedBuilder()
      .setColor("#2F3136")
      .setTitle("🏆 Top Sugerencias del Servidor")
      .setDescription(sorted.map((s, i) =>
        `**#${i + 1}** • [Ver mensaje](https://discord.com/channels/${interaction.guild.id}/${config[interaction.guild.id][s.topic]}/${s.msgId})\n` +
        `💡 **Topic:** ${s.topic}\n🧠 **Autor:** <@${s.author}>\n👍 ${s.upvotes.length} 👎 ${s.downvotes.length}\n> ${s.text}`
      ).join("\n\n") || "No hay sugerencias todavía.")
      .setFooter({ text: "Sistema de Sugerencias | Gideon Studio" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
