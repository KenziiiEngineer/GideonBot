import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { loadPlayers, savePlayers } from "../../systems/ccg2/ccg2Manager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ccg2-setrole")
    .setDescription("Define el rol que se dará automáticamente a los jugadores CCG2.")
    .addRoleOption(r => 
      r.setName("rol")
       .setDescription("Rol de jugadores CCG2")
       .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    const data = loadPlayers();
    data.roleId = rol.id;
    savePlayers(data);

    await interaction.reply({
      content: `✅ Rol asignado correctamente: **${rol.name}**`,
      ephemeral: true
    });
  }
};
