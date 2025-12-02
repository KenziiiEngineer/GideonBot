import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { setCCGChannel } from "../../systems/ccg2/ccg2Manager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ccg2channel")
    .setDescription("Configurar el canal para anuncios de CCG2")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(opt =>
      opt.setName("canal")
        .setDescription("Canal donde se enviarán los registros")
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("canal");

    setCCGChannel(channel.id);

    await interaction.reply({
      content: `📢 Canal de CCG2 configurado en <#${channel.id}>`,
      ephemeral: true
    });
  }
};
