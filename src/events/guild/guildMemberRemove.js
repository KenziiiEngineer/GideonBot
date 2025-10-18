import { sendLog } from "../../systems/logs/logManager.js";

export default {
  name: "guildMemberRemove",
  async execute(member) {
    await sendLog(
      member.guild,
      "Miembro Salió",
      `👋 **${member.user.tag}** ha abandonado el servidor.`,
      "#ED4245"
    );
  }
};
