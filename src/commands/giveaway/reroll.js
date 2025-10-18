import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { getGiveaways } from "../../systems/giveaways/giveawayManager.js";
import { sendLog } from "../../systems/logs/logManager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("reroll")
    .setDescription("Vuelve a sortear ganadores en un sorteo finalizado.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt => opt.setName("id").setDescription("ID del mensaje del sorteo").setRequired(true)),

  async execute(interaction) {
    const id = interaction.options.getString("id");
    const giveaways = await getGiveaways();
    const g = giveaways.find(x => x.messageId === id && x.ended);
    if (!g) return interaction.reply({ content: "❌ Ese sorteo no ha terminado o no existe.", ephemeral: true });

    const channel = await interaction.guild.channels.fetch(g.channelId).catch(() => null);
    const msg = await channel?.messages.fetch(g.messageId).catch(() => null);
    if (!msg) return interaction.reply({ content: "❌ No se encontró el mensaje.", ephemeral: true });

    const reactions = await msg.reactions.cache.get("🎉")?.users.fetch();
    const valid = reactions?.filter(u => !u.bot).map(u => u.id) || [];

    const winners = [];
    for (let i = 0; i < g.winners && valid.length > 0; i++) {
      const random = valid.splice(Math.floor(Math.random() * valid.length), 1)[0];
      winners.push(`<@${random}>`);
    }

    const embed = new EmbedBuilder()
      .setColor("#FEE75C")
      .setTitle("🔁 Nuevo ganador del sorteo")
      .setDescription(`🎁 **${g.prize}**\n🏆 Nuevos ganadores: ${winners.join(", ")}`)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    await sendLog(interaction.guild, "Reroll de Sorteo", `🎁 **${g.prize}** — Nuevos ganadores: ${winners.join(", ")}`);
    await interaction.reply({ content: "✅ Reroll completado.", ephemeral: true });
  }
};
