import { getTickets, saveTickets } from "./ticketUtils.js";

export async function deleteTicket(interaction) {
  const data = await getTickets();
  const ticket = data.find(t => t.channelId === interaction.channel.id);
  if (!ticket) return interaction.reply({ content: "❌ Este canal no es un ticket.", ephemeral: true });

  await interaction.reply("🗑️ Eliminando ticket en 3 segundos...");
  await new Promise(r => setTimeout(r, 3000));

  const updated = data.filter(t => t.channelId !== interaction.channel.id);
  await saveTickets(updated);
  await interaction.channel.delete().catch(() => {});
}
