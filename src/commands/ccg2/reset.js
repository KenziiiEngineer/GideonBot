import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { savePlayers } from "../../systems/ccg2/ccg2Manager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ccg2reset")
    .setDescription("Reiniciar lista de jugadores CCG2")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    savePlayers({ players: [], channel: "" });

    await interaction.reply({
      content: "♻️ La lista de jugadores CCG2 ha sido reiniciada.",
      ephemeral: true
    });
  }
};
