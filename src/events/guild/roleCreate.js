import { sendLog } from "../../systems/logs/logManager.js";

export default {
  name: "roleCreate",
  async execute(role) {
    await sendLog(
      role.guild,
      "Rol Creado",
      `🧩 Rol **${role.name}** fue creado.`,
      "#5865F2"
    );
  }
};
