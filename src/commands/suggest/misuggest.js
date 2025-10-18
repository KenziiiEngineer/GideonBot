import fs from "fs-extra";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("misugerencias")
    .setDescription("💼 Muestra tus sugerencias enviadas."),

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

    const userSugs = Object.entries(guildVotes)
      .filter(([msgId, sug]) => sug.author === interaction.user.id)
      .map(([msgId, sug]) => ({
        msgId,
        topic: sug.topic,
        text: sug.text,
        up: sug.upvotes.length,
        down: sug.downvotes.length,
      }));

    if (userSugs.length === 0) {
      return interaction.reply({ content: "🙁 No has enviado ninguna sugerencia aún.", ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor("#2F3136")
      .setTitle(`💡 Sugerencias de ${interaction.user.username}`)
      .setDescription(
        userSugs.map((s, i) =>
          `**#${i + 1}** • [Ver mensaje](https://discord.com/channels/${interaction.guild.id}/${config[interaction.guild.id][s.topic]}/${s.msgId})\n` +
          `📂 **Topic:** ${s.topic}\n👍 ${s.up} 👎 ${s.down}\n> ${s.text}`
        ).join("\n\n")
      )
      .setFooter({ text: "Sistema de Sugerencias | Gideon Studio" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
