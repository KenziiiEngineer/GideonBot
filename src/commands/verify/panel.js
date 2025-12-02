import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} from "discord.js";
import config from "../../config.json" assert { type: "json" };

export default {
  data: new SlashCommandBuilder()
    .setName("panelverificacion")
    .setDescription("Envía el panel de verificación al canal configurado.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const data = config.verificacion;
    const canal = interaction.guild.channels.cache.get(data.canal);

    if (!canal) {
      return interaction.reply({
        content: "❌ No hay un canal de verificación configurado. Usa `/setverificar canal`.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#43B581")
      .setTitle("🪪 Verificación")
      .setDescription("Haz clic en el botón para verificarte y obtener acceso al servidor.")
      .setFooter({ text: "Sistema de Verificación | Gideon Studio" });

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("verify_user")
        .setLabel("Verificarme ✅")
        .setStyle(ButtonStyle.Success)
    );

    await canal.send({ embeds: [embed], components: [button] });
    await interaction.reply({
      content: `✅ Panel de verificación enviado correctamente en ${canal}`,
      ephemeral: true
    });
  }
};
