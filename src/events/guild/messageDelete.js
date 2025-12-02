import { sendLog } from "../../systems/logs/logManager.js";

export default {
  name: "messageDelete",
  async execute(message) {
    if (!message.guild || !message.author || message.author.bot) return;
    await sendLog(
      message.guild,
      "Mensaje Eliminado",
      `**Autor:** ${message.author.tag}\n**Canal:** ${message.channel}\n**Contenido:** ${message.content || "*[Sin contenido]*"}`,
      "#ED4245"
    );
  }
};
