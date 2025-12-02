import { sendLog } from "../../systems/logs/logManager.js";

export default {
  name: "roleDelete",
  async execute(role) {
    await sendLog(
      role.guild,
      "Rol Eliminado",
      `🧩 Rol **${role.name}** fue eliminado.`,
      "#ED4245"
    );
  }
};
