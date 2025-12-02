import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

import {
  loadPlayers,
  savePlayers,
  getCCGChannel,
  getCCGRole
} from "../../systems/ccg2/ccg2Manager.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ymlPath = path.join(__dirname, "../../systems/ccg2/ccg2_players.yml");

export default {
  data: new SlashCommandBuilder()
    .setName("ccg2-remove")
    .setDescription("Elimina a un jugador del sistema CCG2.")
    .addUserOption(u =>
      u.setName("usuario")
        .setDescription("Usuario a eliminar")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const user = interaction.options.getUser("usuario");

    let data = loadPlayers();
    let players = data.players;

    const channelNotif = getCCGChannel();
    const roleId = getCCGRole();

    const guild = interaction.guild;

    // Buscar al jugador
    const exists = players.find(p => p.userId === user.id);

    if (!exists) {
      return interaction.reply({
        content: `❌ El usuario **${user.username}** no está registrado en CCG2.`,
        ephemeral: true
      });
    }

    // 1. Eliminarlo
    players = players.filter(p => p.userId !== user.id);

    // 2. Renumerar
    players = players.map((p, index) => ({
      ...p,
      number: index + 1
    }));

    // 3. Guardar cambios
    data.players = players;
    savePlayers(data);

    // 4. Quitar rol y renombrar jugador
    let member;
    try {
      member = await guild.members.fetch(user.id);

      // Quitar rol
      if (roleId) {
        const role = guild.roles.cache.get(roleId);
        if (role) await member.roles.remove(role).catch(() => {});
      }

      // Renombrar a su username original
      await member.setNickname(null).catch(() => {});

    } catch (err) {
      console.log("⚠ No se pudo editar al usuario:", err);
    }

    // 5. Renombrar todos los jugadores restantes
    for (const p of players) {
      try {
        const m = await guild.members.fetch(p.userId);

        await m.setNickname(`[${p.number}] ${p.nick}`).catch(() => {});
      } catch (e) {
        console.log("⚠ No pude renombrar a:", p.userId);
      }
    }

    // 6. Notificar en el canal configurado
    if (channelNotif) {
      const canal = guild.channels.cache.get(channelNotif);

      if (canal) {
        await canal.send({
          content:
            `🗑 **Jugador eliminado de CCG2**\n` +
            `• Usuario: <@${user.id}>\n` +
            `• Nick: **${exists.nick}**\n\n` +
            `📄 Archivo actualizado:` ,
          files: [ymlPath]
        });
      }
    }

    await interaction.reply({
      content: `✅ Jugador **${exists.nick}** eliminado correctamente.`,
      ephemeral: true
    });
  }
};
