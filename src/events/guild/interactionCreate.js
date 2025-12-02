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
      // ----------------------------
      // 🔹 1. Slash Commands
      // ----------------------------
      if (interaction.isCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (command) {
          await command.execute(interaction);
        }
        return;
      }

      // ----------------------------
      // 🔹 2. Botones
      // ----------------------------
      if (interaction.isButton()) {
        const id = interaction.customId;

        // 🎟️ Tickets
        if (id === "create_ticket") return createTicket(interaction);
        if (id === "claim_ticket") return claimTicket(interaction);
        if (id === "close_ticket") return closeTicket(interaction);
        if (id === "delete_ticket") return deleteTicket(interaction);

        // 🪪 Verificación
        if (id === "verify_user") return verifyUser(interaction);

        // 🎉 Sorteos
        if (
          id === "join_giveaway" ||
          id === "view_giveaway" ||
          id === "reroll_giveaway" ||
          id.startsWith("contact_staff_")
        ) {
          return handleGiveawayButton(interaction);
        }
      }

      // ----------------------------
      // 🔹 3. Select Menus
      // ----------------------------
      if (interaction.isStringSelectMenu()) {

        // 🎟 NUEVO SISTEMA DE TICKETS (SELECT MENU)
        if (interaction.customId === "ticket_category") {
          const category = interaction.values[0]; // soporte, compras, bug, ccg2
          return createTicket(interaction, category);
        }

        console.log(`🧩 Select Menu usado: ${interaction.customId}`);
      }

      // ----------------------------
      // 🔹 4. Modales
      // ----------------------------
      if (interaction.isModalSubmit()) {
        console.log(`📋 Modal recibido: ${interaction.customId}`);
      }

    } catch (err) {
      console.error("❌ Error en interactionCreate:", err);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "⚠️ Ocurrió un error al procesar tu interacción.",
          ephemeral: true,
        });
      }
    }
  },
};
