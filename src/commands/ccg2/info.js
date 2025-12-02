import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { loadPlayers } from "../../systems/ccg2/ccg2Manager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ccg2info")
    .setDescription("Ver información detallada de un jugador")
    .addStringOption(opt =>
      opt.setName("jugador")
        .setDescription("Nick o número")
        .setRequired(true)
    ),

  async execute(interaction) {
    const input = interaction.options.getString("jugador");
    const data = loadPlayers();

    const player =
      data.players.find(p => p.nick.toLowerCase() === input.toLowerCase()) ||
      data.players.find(p => p.number === parseInt(input));

    if (!player) {
      return interaction.reply("❌ No se encontró ese jugador.");
    }

    const embed = new EmbedBuilder()
      .setColor("#2F3136")
      .setTitle(`📌 Información de ${player.nick}`)
      .addFields(
        { name: "Número", value: `#${player.number}`, inline: true },
        { name: "Usuario", value: `<@${player.userId}>`, inline: true },
        {
          name: "Añadido",
          value: `<t:${Math.floor(player.addedAt / 1000)}:R>`,
          inline: true
        }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
