import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} from "discord.js";

import {
  getCCGRole
} from "../../systems/ccg2/ccg2Manager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ccg2-sreset")
    .setDescription("Limpia TODOS los nicks y quita el rol CCG2 a todos los usuarios que el bot pueda modificar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false), // ❌ No se permite fuera de servidores

  async execute(interaction) {
    // Respuesta inicial
    await interaction.reply({
      content: "⏳ Procesando reinicio del servidor... esto puede tardar unos segundos.",
      ephemeral: true
    });

    const guild = interaction.guild;
    const roleId = getCCGRole();

    // Si no hay rol configurado
    if (!roleId) {
      return interaction.editReply({
        content: "❌ No hay ningún rol configurado con `/ccg2-setrole`.",
        ephemeral: true
      });
    }

    const role = guild.roles.cache.get(roleId);

    if (!role) {
      return interaction.editReply({
        content: "❌ El rol configurado ya no existe en este servidor.",
        ephemeral: true
      });
    }

    let countNick = 0;
    let countRole = 0;

    // Obtener todos los miembros del servidor
    let members;
    try {
      members = await guild.members.fetch();
    } catch (err) {
      return interaction.editReply({
        content: "❌ No pude obtener la lista de miembros. Verifica mis permisos de INTENTS.",
        ephemeral: true
      });
    }

    // Procesar miembros
    for (const member of members.values()) {
      // Ignorar bots
      if (member.user.bot) continue;

      // 1️⃣ QUITAR ROL CCG2
      if (member.roles.cache.has(roleId)) {
        try {
          await member.roles.remove(role);
          countRole++;
        } catch {
          console.log(`⚠ No pude quitar el rol CCG2 a: ${member.user.tag}`);
        }
      }

      // 2️⃣ RESTABLECER NICKNAME (si el bot puede)
      if (member.manageable) {
        try {
          await member.setNickname(null);
          countNick++;
        } catch {
          console.log(`⚠ No pude resetear nickname de: ${member.user.tag}`);
        }
      }
    }

    // Embed final
    const embed = new EmbedBuilder()
      .setColor("#2F3136")
      .setTitle("🧹 Reinicio General del Sistema CCG2")
      .setDescription(
        `Proceso finalizado correctamente.\n\n` +
        `👤 **Nicknames restaurados:** ${countNick}\n` +
        `🎭 **Roles CCG2 removidos:** ${countRole}\n\n` +
        `🟦 Todos los cambios fueron aplicados solo a usuarios que el bot puede modificar.`
      )
      .setTimestamp()
      .setFooter({
        text: "GideonBot • Sistema CCG2",
        iconURL: interaction.client.user.displayAvatarURL()
      });

    // Enviar embed final
    await interaction.followUp({
      embeds: [embed],
      ephemeral: true
    });
  }
};
