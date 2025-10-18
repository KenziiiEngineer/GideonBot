import { sendLog } from "../../systems/logs/logManager.js";

export default {
  name: "channelDelete",
  async execute(channel) {
    await sendLog(
      channel.guild,
      "Canal Eliminado",
      `📚 Canal **${channel.name}** fue eliminado.`,
      "#ED4245"
    );
  }
};
