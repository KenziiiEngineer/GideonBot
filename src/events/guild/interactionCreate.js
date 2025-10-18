import { createTicket } from "../../systems/tickets/ticketCreate.js";
import { claimTicket } from "../../systems/tickets/ticketClaim.js";
import { closeTicket } from "../../systems/tickets/ticketClose.js";
import { deleteTicket } from "../../systems/tickets/ticketDelete.js";
import { verifyUser } from "../../systems/verify/verifySystem.js";
import { handleGiveawayButton } from "../../systems/giveaways/components.js";
import { sendSuggestion } from "../../systems/suggestions/suggestSystem.js";

export default {
  name: "interactionCreate",
  async execute(interaction) {
    try {
      if (interaction.isCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (command) await command.execute(interaction);
        return;
      }

      if (interaction.isButton()) {
        const id = interaction.customId;

        if (id === "create_ticket") return createTicket(interaction);
        if (id === "claim_ticket") return claimTicket(interaction);
        if (id === "close_ticket") return closeTicket(interaction);
        if (id === "delete_ticket") return deleteTicket(interaction);
        if (id === "verify_user") return verifyUser(interaction);
        if (["join_giveaway", "view_giveaway", "reroll_giveaway"].includes(id)) {
          return handleGiveawayButton(interaction);
        }
      }

      if (interaction.isStringSelectMenu()) {
        console.log(`🧩 Select menu usado: ${interaction.customId}`);
      }

      if (interaction.isModalSubmit()) {
        console.log(`📋 Modal enviado: ${interaction.customId}`);
      }
    } catch (err) {
      console.error("❌ Error en interactionCreate:", err);
      if (!interaction.replied)
        await interaction.reply({
          content: "⚠️ Ocurrió un error al procesar tu interacción.",
          ephemeral: true,
        });
    }
  },
};
