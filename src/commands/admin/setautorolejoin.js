import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, "../../data/config.json");

export default {
  data: new SlashCommandBuilder()
    .setName("setautorolejoin")
    .setDescription("⚙️ Configura el rol que se asignará automáticamente al entrar un nuevo miembro.")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Selecciona el rol que se asignará automáticamente.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole("rol");

    // 🔍 Leer config actual
    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (err) {
      config = {};
    }

    // 🧱 Si no existe la sección, la creamos
    if (!config.autorole) config.autorole = {};

    // 📝 Guardar nuevo rol
    config.autorole.rol = role.id;

    // 💾 Guardar en el archivo
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    // ✨ Embed bonito de confirmación
    const embed = new EmbedBuilder()
      .setColor(config.bot?.color || "#2F3136")
      .setTitle("⚙️ Autorole configurado correctamente")
      .setDescription(`✅ El rol **${role.name}** será asignado automáticamente a los nuevos miembros.`)
      .setFooter({
        text: config.bot?.embedFooter || "⚡ GideonBot | Powered by Gideon Studio",
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
