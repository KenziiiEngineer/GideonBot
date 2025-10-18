import fs from "fs-extra";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("setsugerencias")
    .setDescription("🛠️ Configura los topics y sus canales de sugerencias.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt =>
      opt.setName("topic")
        .setDescription("Nombre del topic (ej: gfly, gminigames, general)")
        .setRequired(true)
    )
    .addChannelOption(opt =>
      opt.setName("canal")
        .setDescription("Canal donde se enviarán las sugerencias de ese topic.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const topic = interaction.options.getString("topic").toLowerCase();
    const channel = interaction.options.getChannel("canal");

    const dataPath = "src/data/sugerencias.json";
    const config = fs.existsSync(dataPath) ? await fs.readJson(dataPath) : {};
    if (!config[interaction.guild.id]) config[interaction.guild.id] = {};

    config[interaction.guild.id][topic] = channel.id;
    await fs.outputJson(dataPath, config, { spaces: 2 });

    await interaction.reply({
      content: `✅ Se configuró el topic **${topic}** para usar el canal ${channel}.`,
      ephemeral: true
    });
  }
};
