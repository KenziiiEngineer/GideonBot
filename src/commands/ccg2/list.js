import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
import { loadPlayers } from "../../systems/ccg2/ccg2Manager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ccg2list")
    .setDescription("Mostrar la lista de jugadores CCG2"),

  async execute(interaction) {
    const data = loadPlayers();
    const players = data.players;

    if (players.length === 0) {
      return interaction.reply("📭 No hay jugadores registrados.");
    }

    let page = 0;
    const perPage = 15;
    const totalPages = Math.ceil(players.length / perPage);

    const getPageEmbed = () => {
      const start = page * perPage;
      const items = players.slice(start, start + perPage);

      return new EmbedBuilder()
        .setColor("#2F3136")
        .setTitle(`📋 Lista de Jugadores CCG2 (Página ${page + 1}/${totalPages})`)
        .setDescription(
          items
            .map(p => `**#${p.number}** — ${p.nick} <@${p.userId}>`)
            .join("\n")
        )
        .setFooter({ text: `Mostrando ${items.length} jugadores` });
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev_page")
        .setLabel("⬅️ Anterior")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("next_page")
        .setLabel("Siguiente ➡️")
        .setStyle(ButtonStyle.Secondary)
    );

    const msg = await interaction.reply({
      embeds: [getPageEmbed()],
      components: [row],
      fetchReply: true
    });

    const collector = msg.createMessageComponentCollector({
      time: 120000
    });

    collector.on("collect", async btn => {
      if (btn.user.id !== interaction.user.id)
        return btn.reply({ content: "❌ No puedes usar estos botones.", ephemeral: true });

      if (btn.customId === "next_page" && page < totalPages - 1) {
        page++;
      } else if (btn.customId === "prev_page" && page > 0) {
        page--;
      }

      await btn.update({ embeds: [getPageEmbed()], components: [row] });
    });
  }
};
