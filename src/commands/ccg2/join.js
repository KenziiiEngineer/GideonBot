import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

import {
  loadPlayers,
  savePlayers,
  addPlayer
} from "../../systems/ccg2/ccg2Manager.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ymlPath = path.join(__dirname, "../../systems/ccg2/ccg2_players.yml");

export default {
  data: new SlashCommandBuilder()
    .setName("ccg2-join")
    .setDescription("Añade un jugador al sistema de CCG2.")
    .addStringOption(o =>
      o.setName("nick")
        .setDescription("Nick del jugador")
        .setRequired(true)
    )
    .addUserOption(u =>
      u.setName("usuario")
        .setDescription("Usuario de Discord")
        .setRequired(true)
    )
    ,

  async execute(interaction) {
    const nick = interaction.options.getString("nick");
    const user = interaction.options.getUser("usuario");
    const member = await interaction.guild.members.fetch(user.id);

    const data = loadPlayers();

    // Registrar
    const number = addPlayer(nick, user.id);

    // Renombrar Usuario
    try {
      await member.setNickname(`[${number}] ${nick}`);
    } catch (e) {
      console.log("⚠ No pude cambiar el nickname:", e);
    }

    // Dar rol CCG2
    if (data.roleId) {
      const rol = interaction.guild.roles.cache.get(data.roleId);
      if (rol) {
        try {
          await member.roles.add(rol);
        } catch (e) {
          console.log("⚠ No pude dar el rol:", e);
        }
      }
    }

    // Enviar al canal configurado
    if (data.channel) {
      const channel = interaction.guild.channels.cache.get(data.channel);
      if (channel) {
        await channel.send({
          content: `🎮 **Nuevo jugador registrado en CCG2**\n#${number} — **${nick}** (<@${user.id}>)`,
          files: [ymlPath]
        });
      }
    }

    await interaction.reply({
      content: `✅ Jugador añadido: **#${number} ${nick}**`,
      ephemeral: true
    });
  }
};
