import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs-extra";
import config from "../../config.json" assert { type: "json" };

const path = "./src/config.json";

export default {
  data: new SlashCommandBuilder()
    .setName("setlogs")
    .setDescription("Configura el sistema de logs global del bot.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt =>
      opt.setName("canal").setDescription("Canal donde se enviarán los logs.").setRequired(true)
    ),

  async execute(interaction) {
    const canal = interaction.options.getChannel("canal");

    config.logs.canalGeneral = canal.id;
    await fs.writeJson(path, config, { spaces: 2 });

    await interaction.reply({
      content: `✅ Canal de logs configurado correctamente en ${canal}`,
      ephemeral: true
    });
  }
};

