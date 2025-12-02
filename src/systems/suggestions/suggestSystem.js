import fs from "fs-extra";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

const dataPath = "src/data/sugerencias.json";

/* -----------------------------
   🟦 FUNCIÓN PRINCIPAL: ENVIAR SUGERENCIA
----------------------------- */
export async function sendSuggestion(interaction, topic, text) {
  if (!fs.existsSync(dataPath)) {
    return interaction.reply({
      content: "⚠️ No hay ningún topic configurado aún. Usa `/setsugerencias` primero.",
      ephemeral: true,
    });
  }

  const config = await fs.readJson(dataPath);
  const guildConfig = config[interaction.guild.id];
  if (!guildConfig || !guildConfig[topic]) {
    return interaction.reply({
      content: `⚠️ No existe el topic **${topic}** configurado. Contacta con un admin.`,
      ephemeral: true,
    });
  }

  const channel = interaction.guild.channels.cache.get(guildConfig[topic]);
  if (!channel) {
    return interaction.reply({
      content: "⚠️ El canal configurado para este topic ya no existe.",
      ephemeral: true,
    });
  }

  const embed = new EmbedBuilder()
    .setColor("#2F3136")
    .setTitle("💡 Nueva sugerencia")
    .setDescription(`**Autor:** ${interaction.user}\n**Topic:** ${topic}\n\n> ${text}`)
    .addFields(
      { name: "👍 Votos a favor", value: "0", inline: true },
      { name: "👎 Votos en contra", value: "0", inline: true }
    )
    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
    .setTimestamp()
    .setFooter({ text: "Sistema de Sugerencias | Gideon Studio" });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("sug_upvote").setLabel("👍 Postivo").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("sug_downvote").setLabel("👎 Negativo").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("sug_view").setLabel("👀 Ver participantes").setStyle(ButtonStyle.Secondary)
  );

  const msg = await channel.send({ embeds: [embed], components: [row] });

  // Guardamos en JSON
  if (!config.votes) config.votes = {};
  if (!config.votes[interaction.guild.id]) config.votes[interaction.guild.id] = {};
  config.votes[interaction.guild.id][msg.id] = {
    topic,
    text,
    author: interaction.user.id,
    upvotes: [],
    downvotes: [],
  };

  await fs.outputJson(dataPath, config, { spaces: 2 });
  await interaction.reply({
    content: `✅ Tu sugerencia se envió correctamente al topic **${topic}** (${channel}).`,
    ephemeral: true,
  });
}

/* -----------------------------
   🟦 MANEJADOR DE BOTONES
----------------------------- */
export async function handleSuggestionButtons(interaction) {
  const id = interaction.customId;
  const userId = interaction.user.id;
  const guildId = interaction.guild.id;

  if (!fs.existsSync(dataPath)) return;

  const config = await fs.readJson(dataPath);
  if (!config.votes || !config.votes[guildId] || !config.votes[guildId][interaction.message.id])
    return interaction.reply({ content: "⚠️ No se encontró esta sugerencia en la base de datos.", ephemeral: true });

  const sug = config.votes[guildId][interaction.message.id];
  const embed = EmbedBuilder.from(interaction.message.embeds[0]);

  // Manejo de votos
  if (id === "sug_upvote" || id === "sug_downvote") {
    const isUp = id === "sug_upvote";

    // Si ya votó igual → elimina voto
    if (isUp && sug.upvotes.includes(userId)) {
      sug.upvotes = sug.upvotes.filter((x) => x !== userId);
    } else if (!isUp && sug.downvotes.includes(userId)) {
      sug.downvotes = sug.downvotes.filter((x) => x !== userId);
    } else {
      // Si vota distinto → remueve del otro
      if (isUp) {
        sug.downvotes = sug.downvotes.filter((x) => x !== userId);
        sug.upvotes.push(userId);
      } else {
        sug.upvotes = sug.upvotes.filter((x) => x !== userId);
        sug.downvotes.push(userId);
      }
    }

    // Actualizar campos del embed
    const newEmbed = EmbedBuilder.from(embed)
      .setFields(
        { name: "👍 Votos a favor", value: `${sug.upvotes.length}`, inline: true },
        { name: "👎 Votos en contra", value: `${sug.downvotes.length}`, inline: true }
      )
      .setFooter({ text: `Sistema de Sugerencias | Gideon Studio` });

    await interaction.message.edit({ embeds: [newEmbed] });
    await fs.outputJson(dataPath, config, { spaces: 2 });

    return interaction.reply({ content: `✅ Tu voto ha sido registrado.`, ephemeral: true });
  }

  // Mostrar votantes
  if (id === "sug_view") {
    const up = sug.upvotes.map((u) => `<@${u}>`).join(", ") || "Nadie";
    const down = sug.downvotes.map((u) => `<@${u}>`).join(", ") || "Nadie";

    return interaction.reply({
      content: `👥 **Participantes:**\n\n👍 A favor: ${up}\n👎 En contra: ${down}`,
      ephemeral: true,
    });
  }
}
