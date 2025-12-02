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
    name: `${member.user.username}`,
    iconURL: member.user.displayAvatarURL({ dynamic: true })
  })
  .setTitle(`¡Nuevo miembro en ⚡ Gideon Studio!`)
  .setDescription(
    `Bienvenido/a <@${member.id}> al servidor oficial de **Gideon Studio**.\n` +
    `Aquí trabajamos con proyectos de desarrollo, sistemas avanzados, bots, plugins, mods y tecnologías digitales.\n` +
    `Explora, participa y forma parte del ecosistema del estudio.`
  )
  .addFields(
    {
      name: "🔗 Visita nuestros canales recomendados:",
      value:
        `> <#1402413896664612964> ・ 📜 **Reglamento**\n` +
        `> <#1402427014740316170> ・ ℹ️ **Información**\n` +
        `> <#1429553971068145824> ・ 🛒 **Plugins**`
    },
    {
      name: "👥 Numero De Usuarios:",
      value: `¡Ahora somos **${member.guild.memberCount}** miembros dentro del estudio!`
    },
    {
      name: "🌐 Enlaces Oficiales",
      value:
        `📌 **Página Web:** https://gideon.studio\n` +
        `📌 **Portafolio:** https://bento.me/gideonstudio`,
      inline: false
    }
  )
  .setThumbnail("https://cdn.discordapp.com/emojis/123456789012345678.webp?size=128") // o tu logo
  .setImage("https://cdn.discordapp.com/emojis/123456789012345678.webp?size=128") // opcional
  .setFooter({
    text: data.bot.embedFooter,
    iconURL: member.client.user.displayAvatarURL()
  })
  .setTimestamp();

  // 💌 Embed privado (en el DM)
const privateEmbed = new EmbedBuilder()
  .setColor("#2B2D31")
  .setTitle("💼 Bienvenido a Gideon Studio")
  .setDescription(
    `Hola **${member.user.username}**, gracias por unirte al ecosistema de **Gideon Studio**.\n\n` +
    `Somos un estudio enfocado en desarrollo, tecnología y creación digital. Aquí podrás conocer nuestros proyectos, participar en la comunidad y estar atento a las novedades.\n\n` +
    `🔗 **Conéctate con nosotros:**\n` +
    `• 🌐 Web: https://gideon.studio\n` +
    `• 🎬 YouTube: https://youtube.com/@GideonStudio\n` +
    `• 💼 Portafolio: https://bento.me/gideonstudio\n\n` +
    `Gracias por formar parte de esta experiencia. Tu presencia suma al crecimiento del estudio.`
  )
  .setThumbnail(member.guild.iconURL({ dynamic: true }))
  .setFooter({
    text: "GideonBot • Powered by Gideon Studio",
    iconURL: member.client.user.displayAvatarURL()
  })
  .setTimestamp();

  await channel.send({ embeds: [publicEmbed] });

  try {
    await member.send({ embeds: [privateEmbed] });
  } catch {
    console.warn(`⚠️ No se pudo enviar DM a ${member.user.tag}`);
  }
}
