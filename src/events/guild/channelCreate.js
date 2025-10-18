import { sendLog } from "../../systems/logs/logManager.js";

export default {
  name: "channelCreate",
  async execute(channel) {
    await sendLog(
      channel.guild,
      "Canal Creado",
      `📚 Canal **${channel.name}** (${channel.type}) fue creado.`,
      "#57F287"
    );
  }
};
