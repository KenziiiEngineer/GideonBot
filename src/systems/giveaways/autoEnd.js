import { getGiveaways, saveGiveaways } from "./giveawayManager.js";
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";
import { sendLog } from "../logs/logManager.js";

export async function autoGiveawayManager(client) {
  setInterval(async () => {
    const giveaways = await getGiveaways();
    let changed = false;

    for (const g of giveaways) {
      const guild = client.guilds.cache.get(g.guildId);
      if (!guild) continue;

      const channel = guild.channels.cache.get(g.channelId);
      const msg = await channel?.messages.fetch(g.messageId).catch(() => null);
      if (!msg) continue;

      // 🕒 cierre automático
      if (!g.ended && g.endTime <= Date.now()) {
        const valid = [...g.participants];
        const winners = [];
        for (let i = 0; i < g.winners && valid.length > 0; i++) {
          const random = valid.splice(Math.floor(Math.random() * valid.length), 1)[0];
          winners.push(`<@${random}>`);
        }

        const embed = new EmbedBuilder()
          .setColor("#57F287")
          .setTitle("🎉 **SORTEO FINALIZADO**")
          .setDescription(`🎁 **${g.prize}**\n🏆 **Ganadores:** ${winners.length ? winners.join(", ") : "Nadie participó."}`)
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("reroll_giveaway")
            .setLabel("🔁 Reroll")
            .setStyle(ButtonStyle.Danger)
        );

        await msg.edit({ embeds: [embed], components: [row] });

  for (const w of winners) {
  const user = await client.users.fetch(w.replace(/[<@>]/g, "")).catch(() => null);
  if (user) {
    try {
      await user.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#2F3136")
            .setTitle("⚡ ¡Has ganado un sorteo en GideonBot!")
            .setDescription(
              `> 🎉 **${user.username}**, tu suerte brilló hoy.\n\n` +
              `Has ganado el sorteo de **${g.prize}** en el servidor **${guild.name}** 🏆\n\n` +
              `Pulsa el botón de abajo para **reclamar tu premio** o **visitar el servidor**.`
            )
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setFooter({
              text: "Sistema de Sorteos | Gideon Studio",
              iconURL: client.user.displayAvatarURL()
            })
            .setTimestamp()
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("💬 Ir al servidor")
              .setStyle(ButtonStyle.Link)
              .setURL(`https://discord.com/channels/${guild.id}`),
            new ButtonBuilder()
              .setCustomId(`contact_staff_${g.messageId}`)
              .setLabel("🎁 Reclamar premio")
              .setStyle(ButtonStyle.Primary)
          )
        ]
      });
    } catch (err) {
      console.warn(`⚠️ No se pudo enviar DM a ${user.tag}`);
    }
  }
}

        await sendLog(
          guild,
          "Sorteo Finalizado",
          `🎁 **${g.prize}** — Ganadores: ${winners.join(", ")}`
        );

        g.ended = true;
        changed = true;
      }

      // 🔄 actualización del embed mientras está activo
      if (!g.ended && Date.now() < g.endTime) {
        const embed = new EmbedBuilder()
          .setColor("#FEE75C")
          .setTitle("🎉 **¡SORTEO ACTIVO!**")
          .setDescription(
            `🎁 **${g.prize}**\n` +
            `🏆 **Ganadores:** ${g.winners}\n` +
            `👥 **Participantes:** ${g.participants.length}\n` +
            `⏰ Termina en <t:${Math.floor(g.endTime / 1000)}:R>`
          )
          .setFooter({ text: "Presiona el botón para participar 🎉" });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("join_giveaway")
            .setLabel("🎉 Participar")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("view_giveaway")
            .setLabel("👀 Ver participantes")
            .setStyle(ButtonStyle.Secondary)
        );

        await msg.edit({ embeds: [embed], components: [row] }).catch(() => {});
      }
    }

    if (changed) await saveGiveaways(giveaways);
  }, 15000); // cada 15 segundos
}
