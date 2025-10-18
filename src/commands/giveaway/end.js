import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { getGiveaways, saveGiveaways } from "../../systems/giveaways/giveawayManager.js";
import { EmbedBuilder } from "discord.js";
import { sendLog } from "../../systems/logs/logManager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("endgiveaway")
    .setDescription("Finaliza un sorteo manualmente.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt => opt.setName("id").setDescription("ID del mensaje del sorteo").setRequired(true)),

  async execute(interaction) {
    const id = interaction.options.getString("id");
    const giveaways = await getGiveaways();
    const g = giveaways.find(x => x.messageId === id);
    if (!g) return interaction.reply({ content: "❌ No se encontró ese sorteo.", ephemeral: true });

    const channel = await interaction.guild.channels.fetch(g.channelId).catch(() => null);
    if (!channel) return interaction.reply({ content: "❌ No se encontró el canal del sorteo.", ephemeral: true });
    const msg = await channel.messages.fetch(g.messageId).catch(() => null);
    if (!msg) return interaction.reply({ content: "❌ No se encontró el mensaje.", ephemeral: true });

    const reactions = await msg.reactions.cache.get("🎉")?.users.fetch();
    const valid = reactions?.filter(u => !u.bot).map(u => u.id) || [];
    if (valid.length === 0) return interaction.reply({ content: "⚠️ No hubo participantes.", ephemeral: true });

    const winners = [];
    for (let i = 0; i < g.winners && valid.length > 0; i++) {
      const random = valid.splice(Math.floor(Math.random() * valid.length), 1)[0];
      winners.push(`<@${random}>`);
    }

    const embed = new EmbedBuilder()
      .setColor("#57F287")
      .setTitle("🎉 Sorteo finalizado")
      .setDescription(`🎁 **${g.prize}**\n🏆 Ganadores: ${winners.join(", ")}`)
      .setTimestamp();

    await msg.edit({ embeds: [embed] });
    await sendLog(interaction.guild, "Sorteo Finalizado", `🎁 **${g.prize}** — Ganadores: ${winners.join(", ")}`);
    await interaction.reply({ content: "✅ Sorteo cerrado manualmente.", ephemeral: true });

    g.ended = true;
    await saveGiveaways(giveaways);
  }
};
