import { EmbedBuilder } from "discord.js";
import { getTickets, saveTickets } from "./ticketUtils.js";
import * as discordTranscripts from "discord-html-transcripts";
import config from "../../config.json" assert { type: "json" };

export async function closeTicket(interaction) {
  const tickets = await getTickets();
  const ticket = tickets.find(t => t.channelId === interaction.channel.id);

  if (!ticket)
    return interaction.reply({ content: "❌ Este canal no es un ticket válido o ya fue cerrado.", ephemeral: true });

  const guild = interaction.guild;
  const user = await guild.members.fetch(ticket.userId).catch(() => null);
  const staff = ticket.claimed ? await guild.members.fetch(ticket.claimed).catch(() => null) : null;

  // Crear transcript
  const transcript = await discordTranscripts.createTranscript(interaction.channel, {
    limit: -1,
    saveImages: false,
    filename: `ticket-${interaction.channel.name}.html`,
    returnBuffer: false,
    filter: msg => !msg.author.bot
  });

  // Canal de logs dinámico
  const logsChannel = guild.channels.cache.get(config.tickets.canalLogs);
  const embed = new EmbedBuilder()
    .setColor("#ED4245")
    .setTitle("📕 Ticket Cerrado")
    .addFields(
      { name: "Usuario", value: user ? `<@${user.id}>` : "Desconocido", inline: true },
      { name: "Moderador", value: `<@${interaction.user.id}>`, inline: true },
      { name: "Reclamado por", value: staff ? `<@${staff.id}>` : "Nadie", inline: true }
    );

  // Enviar logs
  if (logsChannel) await logsChannel.send({ embeds: [embed], files: [transcript] });

  // Enviar transcript por DM
  if (user) {
    await user.send({ content: "🧾 Aquí tienes la transcripción de tu ticket:", files: [transcript] }).catch(() => {});
  }
  if (staff) {
    await staff.send({ content: "🧾 El ticket que reclamaste fue cerrado:", files: [transcript] }).catch(() => {});
  }

  // Responder antes de eliminar
  if (!interaction.replied) {
    await interaction.reply({ content: "🧾 Ticket cerrado. Eliminando en 5 segundos...", ephemeral: true });
  }

  // Eliminar registro del ticket ANTES de eliminar el canal
  const updated = tickets.filter(t => t.channelId !== interaction.channel.id);
  await saveTickets(updated);

  // Esperar y eliminar canal
  setTimeout(async () => {
    if (interaction.channel && interaction.channel.deletable) {
      await interaction.channel.delete().catch(() => {});
    }
  }, 5000);
}
