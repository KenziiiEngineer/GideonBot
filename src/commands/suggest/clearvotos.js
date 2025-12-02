import fs from "fs-extra";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("clearvotos")
    .setDescription("🧹 Limpia los votos de una sugerencia específica.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt =>
      opt.setName("mensajeid")
        .setDescription("ID del mensaje de la sugerencia (clic derecho → Copiar ID)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const msgId = interaction.options.getString("mensajeid");
    const dataPath = "src/data/sugerencias.json";
    if (!fs.existsSync(dataPath))
      return interaction.reply({ content: "⚠️ No hay sugerencias registradas.", ephemeral: true });

    const config = await fs.readJson(dataPath);
    const guildVotes = config.votes?.[interaction.guild.id];
    if (!guildVotes || !guildVotes[msgId])
      return interaction.reply({ content: "❌ No se encontró esa sugerencia en la base de datos.", ephemeral: true });

    guildVotes[msgId].upvotes = [];
    guildVotes[msgId].downvotes = [];

    await fs.outputJson(dataPath, config, { spaces: 2 });
    await interaction.reply({ content: `✅ Votos limpiados para la sugerencia **${msgId}**.`, ephemeral: true });
  }
};
