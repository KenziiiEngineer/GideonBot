import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { startGiveaway } from "../../systems/giveaways/giveawayManager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Sistema de sorteos.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub
        .setName("start")
        .setDescription("Inicia un sorteo.")
        .addStringOption(opt =>
          opt.setName("duracion")
            .setDescription("Ej: 10m, 1h, 2d")
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName("premio")
            .setDescription("Premio del sorteo.")
            .setRequired(true)
        )
        .addIntegerOption(opt =>
          opt.setName("ganadores")
            .setDescription("Cantidad de ganadores.")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === "start") return startGiveaway(interaction);
  }
};
