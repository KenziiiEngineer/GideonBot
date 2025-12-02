import { Events } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sendWelcome } from "../../systems/welcome/welcomeSystem.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, "../../config.json");

export default {
  name: Events.GuildMemberAdd,

  async execute(member) {
    try {
      // =============================
      // 📌 AUTOROLE (lo que ya tenías)
      // =============================
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      const roleId = config?.autorole?.rol;

      if (roleId) {
        const role = member.guild.roles.cache.get(roleId);
        if (role) {
          await member.roles.add(role).catch(() => {});
          console.log(`✅ Rol ${role.name} asignado automáticamente a ${member.user.tag}`);
        }
      }

      // =============================
      // 🎉 SISTEMA DE BIENVENIDA
      // =============================
      await sendWelcome(member);

    } catch (err) {
      console.error("❌ Error en el sistema de bienvenida:", err);
    }
  },
};
