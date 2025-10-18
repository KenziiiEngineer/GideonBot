import fs from "fs";
import path from "path";
import { EmbedBuilder } from "discord.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, "../../config.json");

function getConfig() {
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function saveConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

// 🧩 Configurar canal de bienvenida
export function setWelcomeChannel(channelId) {
  const data = getConfig();
  data.welcome.canal = channelId;
  saveConfig(data);
}

// 🎉 Enviar mensaje de bienvenida
export async function sendWelcome(member) {
  const data = getConfig();
  const canalId = data.welcome.canal;
  if (!canalId) return;

  const channel = member.guild.channels.cache.get(canalId);
  if (!channel) return;

  // 🟦 Embed público (en el servidor)
  const publicEmbed = new EmbedBuilder()
    .setColor(data.bot.color || "#5865F2")
    .setAuthor({
      name: `🎉 ¡Bienvenido a ${member.guild.name}!`,
      iconURL: member.guild.iconURL({ dynamic: true }),
    })
    .setDescription(
      `> 👋 **${member.user.username}**, nos alegra tenerte en **${member.guild.name}**.\n\n` +
      `✨ Explora los canales, lee las reglas y forma parte de la comunidad.`
    )
    .addFields(
      { name: "📅 Fecha de ingreso", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
      { name: "🆔 Usuario", value: member.user.tag, inline: true }
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
    .setFooter({
      text: data.bot.embedFooter,
      iconURL: member.client.user.displayAvatarURL(),
    })
    .setTimestamp();

  // 💌 Embed privado (en el DM)
  const privateEmbed = new EmbedBuilder()
    .setColor("#2B2D31")
    .setTitle("💌 ¡Bienvenido a la experiencia Gideon Studio!")
    .setDescription(
      `Hola **${member.user.username}**, gracias por unirte a **${member.guild.name}** 💙\n\n` +
      `🚀 Participa, diviértete y sé parte de esta comunidad. ¡Nos encanta tenerte aquí!`
    )
    .setThumbnail(member.guild.iconURL({ dynamic: true }))
    .setFooter({
      text: "GideonBot | Powered by Gideon Studio",
      iconURL: member.client.user.displayAvatarURL(),
    })
    .setTimestamp();

  await channel.send({ embeds: [publicEmbed] });

  try {
    await member.send({ embeds: [privateEmbed] });
  } catch {
    console.warn(`⚠️ No se pudo enviar DM a ${member.user.tag}`);
  }
}
