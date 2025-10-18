import { EmbedBuilder } from "discord.js";
import config from "../../config.json" assert { type: "json" };

export async function verifyUser(interaction) {
  const verifyData = config.verificacion;
  const member = interaction.member;

  const rolesToAdd = verifyData.rolesAgregar || [];
  const roleToRemove = verifyData.rolQuitar || null;

  try {
    for (const roleId of rolesToAdd) {
      const role = interaction.guild.roles.cache.get(roleId);
      if (role) await member.roles.add(role).catch(() => {});
    }

    if (roleToRemove) {
      const role = interaction.guild.roles.cache.get(roleToRemove);
      if (role && member.roles.cache.has(role.id)) {
        await member.roles.remove(role).catch(() => {});
      }
    }

    const embed = new EmbedBuilder()
      .setColor("#43B581")
      .setTitle("✅ ¡Verificación completada!")
      .setDescription(`Has sido verificado correctamente, <@${member.id}>.`)
      .setFooter({ text: "Sistema de Verificación | GideonBot" });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: "❌ Error al verificarte.", ephemeral: true });
  }
}
