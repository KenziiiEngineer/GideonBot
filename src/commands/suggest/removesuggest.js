import fs from "fs-extra";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("removesugerencia")
    .setDescription("🗑️ Elimina completamente una sugerencia del sistema.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt =>
      opt.setName("mensajeid")
        .setDescription("ID del mensaje de la sugerencia que deseas eliminar.")
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
      return interaction.reply({ content: "❌ No se encontró esa sugerencia.", ephemeral: true });

    const sug = guildVotes[msgId];
    const channel = interaction.guild.channels.cache.get(config[interaction.guild.id][sug.topic]);
    try {
      const msg = await channel.messages.fetch(msgId);
      if (msg) await msg.delete();
    } catch (err) {
      console.warn("⚠️ No se pudo eliminar el mensaje del canal (puede ya no existir).");
    }

    delete guildVotes[msgId];
    await fs.outputJson(dataPath, config, { spaces: 2 });

    await interaction.reply({ content: `✅ Sugerencia **${msgId}** eliminada correctamente.`, ephemeral: true });
  }
};
