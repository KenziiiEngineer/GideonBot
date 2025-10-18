import fs from "fs-extra";
import { SlashCommandBuilder } from "discord.js";
import { sendSuggestion } from "../../systems/suggestions/suggestSystem.js";

export default {
  data: new SlashCommandBuilder()
    .setName("sugerencia")
    .setDescription("💡 Envía una sugerencia a un topic específico.")
    .addStringOption(opt =>
      opt.setName("topic")
        .setDescription("Elige el topic (ej: gfly, gminigames, general)")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("sugerencia")
        .setDescription("Escribe tu sugerencia aquí.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const topic = interaction.options.getString("topic").toLowerCase();
    const text = interaction.options.getString("sugerencia");

    await sendSuggestion(interaction, topic, text);
  }
};
