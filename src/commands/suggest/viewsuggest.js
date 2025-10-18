import fs from "fs-extra";
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("viewsuggest")
    .setDescription("📂 Muestra todas las sugerencias de un topic específico.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt =>
      opt.setName("topic")
        .setDescription("Nombre del topic (ej: gfly, gminigames, general)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const topic = interaction.options.getString("topic").toLowerCase();
    const dataPath = "src/data/sugerencias.json";
    if (!fs.existsSync(dataPath))
      return interaction.reply({ content: "⚠️ No hay sugerencias registradas.", ephemeral: true });

    const config = await fs.readJson(dataPath);
    const guildVotes = config.votes?.[interaction.guild.id];
    if (!guildVotes)
      return interaction.reply({ content: "⚠️ No hay sugerencias en este servidor.", ephemeral: true });

    const suggestions = Object.entries(guildVotes)
      .filter(([msgId, sug]) => sug.topic === topic)
      .map(([msgId, sug]) => ({
        msgId,
        text: sug.text,
        author: sug.author,
        up: sug.upvotes.length,
        down: sug.downvotes.length,
      }));

    if (suggestions.length === 0)
      return interaction.reply({ content: `⚠️ No hay sugerencias en el topic **${topic}**.`, ephemeral: true });

    const embed = new EmbedBuilder()
      .setColor("#2F3136")
      .setTitle(`📂 Sugerencias del topic: ${topic}`)
      .setDescription(
        suggestions.map((s, i) =>
          `**#${i + 1}** • [Ver mensaje](https://discord.com/channels/${interaction.guild.id}/${config[interaction.guild.id][topic]}/${s.msgId})\n` +
          `🧠 **Autor:** <@${s.author}>\n👍 ${s.up} 👎 ${s.down}\n> ${s.text}`
        ).join("\n\n")
      )
      .setFooter({ text: "Sistema de Sugerencias | Gideon Studio" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
