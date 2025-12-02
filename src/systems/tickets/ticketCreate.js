import {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

import { getTickets, saveTickets } from "./ticketUtils.js";
import config from "../../config.json" assert { type: "json" };

export async function createTicket(interaction, category = "soporte") {
  try {
    const data = config.tickets;
    const user = interaction.user;
    const guild = interaction.guild;

    const categoryId = data.categoria || null;
    const staffRoleId = data.rolStaffGlobal || null;

    // -------------------------
    // ✔ Cargar Tickets
    // -------------------------
    const tickets = await getTickets();
    const existing = tickets.find(t => t.userId === user.id);

    if (existing) {
      return interaction.reply({
        content: "❌ Ya tienes un ticket abierto.",
        ephemeral: true
      });
    }

    // -------------------------
    // ✔ Categoría Padre (opcional)
    // -------------------------
    let parent = null;
    if (categoryId) {
      const temp = guild.channels.cache.get(categoryId);
      if (temp) parent = temp;
    }

    // -------------------------
    // ✔ Permisos del canal
    // -------------------------
    const overwrites = [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      }
    ];

    if (staffRoleId && guild.roles.cache.has(staffRoleId)) {
      overwrites.push({
        id: staffRoleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      });
    }

    // -------------------------
    // ✔ NOMBRES por categoría
    // -------------------------
    const channelName = {
      soporte: `soporte-${user.username}`,
      compras: `compras-${user.username}`,
      bug: `bug-${user.username}`,
      ccg2: `ccg2-${user.username}`
    }[category] || `ticket-${user.username}`;

    // -------------------------
    // ✔ Crear canal
    // -------------------------
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: parent || null,
      permissionOverwrites: overwrites
    });

    // Guardar ticket
    tickets.push({
      userId: user.id,
      channelId: channel.id,
      category,
      claimed: null
    });

    await saveTickets(tickets);

    // -------------------------
    // ✔ Mensajes por categoría
    // -------------------------
    const descriptions = {
      soporte: "🛠 **Soporte General** — Describe tu problema para ayudarte.",
      compras: "🛒 **Compras / Pagos** — Adjunta tu comprobante y explica tu situación.",
      bug: "🐞 **Reporte de Bug** — Explica el error, cuándo pasó y cómo reproducirlo.",
      ccg2: "🦑 **CCG2** — Escribe tu duda o problema relacionado al evento."
    };

    const embed = new EmbedBuilder()
      .setColor(config.bot.color)
      .setTitle("🎫 Ticket creado")
      .setDescription(descriptions[category] || "Un miembro del equipo te atenderá en breve.")
      .setFooter({ text: config.bot.embedFooter });

    // -------------------------
    // ✔ Controles del ticket
    // -------------------------
    const controls = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("claim_ticket")
        .setLabel("Reclamar")
        .setEmoji("🧑‍💼")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("Cerrar")
        .setEmoji("📕")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("delete_ticket")
        .setLabel("Borrar")
        .setEmoji("🗑️")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `<@${user.id}>`,
      embeds: [embed],
      components: [controls]
    });

    await interaction.reply({
      content: `✅ Ticket creado: ${channel}`,
      ephemeral: true
    });

  } catch (err) {
    console.error("❌ Error creando ticket:", err);

    if (!interaction.replied) {
      await interaction.reply({
        content: "⚠️ Ocurrió un error al crear tu ticket.",
        ephemeral: true
      });
    }
  }
}
