import { SlashCommandBuilder } from "discord.js";
import { claimTicket } from "../../systems/tickets/ticketClaim.js";

export default {
  data: new SlashCommandBuilder()
    .setName("claim")
    .setDescription("Reclama el ticket actual para atenderlo."),
  async execute(interaction) {
    await claimTicket(interaction);
  }
};
