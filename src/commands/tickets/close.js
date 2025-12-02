import { SlashCommandBuilder } from "discord.js";
import { closeTicket } from "../../systems/tickets/ticketClose.js";

export default {
  data: new SlashCommandBuilder()
    .setName("close")
    .setDescription("Cierra el ticket actual y genera un transcript."),
  async execute(interaction) {
    await closeTicket(interaction);
  }
};
