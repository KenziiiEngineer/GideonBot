import { PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { getTickets, saveTickets } from "./ticketUtils.js";
import config from "../../config.json" assert { type: "json" };

export async function claimTicket(interaction) {
  const member = interaction.member;
  const channel = interaction.channel;
  const guild = interaction.guild;
  const tickets = await getTickets();
  const ticket = tickets.find(t => t.channelId === channel.id);
  if (!ticket) return interaction.reply({ content: "❌ Este canal no es un ticket.", ephemeral: true });
  if (ticket.claimed) return interaction.reply({ content: "❌ Este ticket ya fue reclamado.", ephemeral: true });

  ticket.claimed = member.id;

  const user = await guild.members.fetch(ticket.userId).catch(() => null);
  const staffGlobal = config.tickets.rolStaffGlobal;

  const overwrites = [
    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
  ];

  if (staffGlobal && guild.roles.cache.has(staffGlobal)) {
    overwrites.push({
      id: staffGlobal,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
    });
  }

  await channel.permissionOverwrites.set(overwrites);
  await saveTickets(tickets);

  const embed = new EmbedBuilder()
    .setColor("#43B581")
    .setTitle("🧑‍💼 Ticket reclamado")
    .setDescription(`El ticket fue reclamado por <@${member.id}>.`);

  await channel.send({ embeds: [embed] });
  await interaction.reply({ content: "✅ Ticket reclamado correctamente.", ephemeral: true });
}
