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

export async function createTicket(interaction) {
  const data = config.tickets;
  const user = interaction.user;
  const guild = interaction.guild;
  const categoryId = data.categoria || null;
  const staffRoleId = data.rolStaffGlobal || null;

  const tickets = await getTickets();
  const existing = tickets.find(t => t.userId === user.id);
  if (existing) {
    return interaction.reply({ content: "❌ Ya tienes un ticket abierto.", ephemeral: true });
  }

  const parent = categoryId ? guild.channels.cache.get(categoryId) : null;

  const overwrites = [
    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
  ];

  if (staffRoleId && guild.roles.cache.has(staffRoleId)) {
    overwrites.push({
      id: staffRoleId,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
    });
  }

  const channel = await guild.channels.create({
    name: `ticket-${user.username}`,
    type: ChannelType.GuildText,
    parent: parent || null,
    permissionOverwrites: overwrites
  });

  tickets.push({
    userId: user.id,
    channelId: channel.id,
    claimed: null
  });

  await saveTickets(tickets);

  const embed = new EmbedBuilder()
    .setColor(config.bot.color)
    .setTitle("🎫 Ticket creado")
    .setDescription("Un miembro del equipo te atenderá en breve.");

  const controls = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("claim_ticket").setLabel("Reclamar").setEmoji("🧑‍💼").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("close_ticket").setLabel("Cerrar").setEmoji("📕").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("delete_ticket").setLabel("Borrar").setEmoji("🗑️").setStyle(ButtonStyle.Danger)
  );

  await channel.send({ content: `<@${user.id}>`, embeds: [embed], components: [controls] });
  await interaction.reply({ content: `✅ Ticket creado: ${channel}`, ephemeral: true });
}
