import { Events } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, "../../data/config.json");

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      const roleId = config?.autorole?.rol;

      if (!roleId) return;
      const role = member.guild.roles.cache.get(roleId);
      if (!role) return;

      await member.roles.add(role);
      console.log(`✅ Rol ${role.name} asignado automáticamente a ${member.user.tag}`);
    } catch (err) {
      console.error("❌ Error asignando autorole:", err);
    }
  },
};
