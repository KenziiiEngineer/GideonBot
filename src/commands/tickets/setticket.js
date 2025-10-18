import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs-extra";
import config from "../../config.json" assert { type: "json" };

const path = "./src/config.json";

export default {
  data: new SlashCommandBuilder()
    .setName("setticket")
    .setDescription("Configura el sistema de tickets.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub
        .setName("categoria")
        .setDescription("Define la categoría donde se crearán los tickets.")
        .addChannelOption(opt =>
          opt.setName("categoria").setDescription("Selecciona la categoría").setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("logs")
        .setDescription("Define el canal donde se enviarán los logs de tickets.")
        .addChannelOption(opt =>
          opt.setName("canal").setDescription("Selecciona el canal de logs").setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("mensaje")
        .setDescription("Cambia el mensaje que aparece en el panel de tickets.")
        .addStringOption(opt =>
          opt.setName("texto").setDescription("Texto personalizado del panel").setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("rolstaff")
        .setDescription("Establece el rol que tendrá acceso global a todos los tickets.")
        .addRoleOption(opt =>
          opt.setName("rol").setDescription("Rol staff global").setRequired(true)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "categoria": {
        const categoria = interaction.options.getChannel("categoria");
        if (categoria.type !== 4) {
          return interaction.reply({ content: "❌ Debes seleccionar una **categoría** válida.", ephemeral: true });
        }
        config.tickets.categoria = categoria.id;
        break;
      }

      case "logs": {
        const canal = interaction.options.getChannel("canal");
        config.tickets.canalLogs = canal.id;
        break;
      }

      case "mensaje": {
        const texto = interaction.options.getString("texto");
        config.tickets.mensajePanel = texto;
        break;
      }

      case "rolstaff": {
        const rol = interaction.options.getRole("rol");
        config.tickets.rolStaffGlobal = rol.id;
        break;
      }
    }

    await fs.writeJson(path, config, { spaces: 2 });
    await interaction.reply({ content: "✅ Configuración de tickets actualizada correctamente.", ephemeral: true });
  }
};
