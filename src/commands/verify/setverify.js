import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs-extra";
import config from "../../config.json" assert { type: "json" };

const path = "./src/config.json";

export default {
  data: new SlashCommandBuilder()
    .setName("setverificar")
    .setDescription("Configura el sistema de verificación.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub
        .setName("canal")
        .setDescription("Define el canal donde se enviará el panel de verificación.")
        .addChannelOption(opt =>
          opt.setName("canal").setDescription("Canal de verificación").setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("rolesagregar")
        .setDescription("Define los roles que se darán al verificar.")
        .addRoleOption(opt => opt.setName("rol1").setDescription("Primer rol a agregar").setRequired(true))
        .addRoleOption(opt => opt.setName("rol2").setDescription("Segundo rol a agregar").setRequired(false))
    )
    .addSubcommand(sub =>
      sub
        .setName("rolquitar")
        .setDescription("Define el rol que se quitará al verificar.")
        .addRoleOption(opt => opt.setName("rol").setDescription("Rol a quitar").setRequired(true))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "canal": {
        const canal = interaction.options.getChannel("canal");
        config.verificacion.canal = canal.id;
        break;
      }

      case "rolesagregar": {
        const rol1 = interaction.options.getRole("rol1");
        const rol2 = interaction.options.getRole("rol2");
        config.verificacion.rolesAgregar = [rol1.id];
        if (rol2) config.verificacion.rolesAgregar.push(rol2.id);
        break;
      }

      case "rolquitar": {
        const rol = interaction.options.getRole("rol");
        config.verificacion.rolQuitar = rol.id;
        break;
      }
    }

    await fs.writeJson(path, config, { spaces: 2 });
    await interaction.reply({ content: "✅ Configuración de verificación actualizada correctamente.", ephemeral: true });
  }
};
