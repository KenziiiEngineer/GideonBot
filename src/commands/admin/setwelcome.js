import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { setWelcomeChannel } from "../../systems/welcome/welcomeSystem.js";

export default {
  data: new SlashCommandBuilder()
    .setName("setwelcome")
    .setDescription("📢 Configura el canal donde se enviarán las bienvenidas")
    .addChannelOption(opt =>
      opt
        .setName("canal")
        .setDescription("Selecciona el canal de bienvenida")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const canal = interaction.options.getChannel("canal");
    setWelcomeChannel(canal.id);

    const embed = new EmbedBuilder()
      .setColor("#57F287")
      .setTitle("✅ Canal de bienvenida configurado")
      .setDescription(`Las bienvenidas se enviarán en ${canal}`)
      .setFooter({
        text: "Sistema de bienvenida | GideonBot",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
