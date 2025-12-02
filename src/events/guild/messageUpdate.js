import { sendLog } from "../../systems/logs/logManager.js";

export default {
  name: "messageUpdate",
  async execute(oldMessage, newMessage) {
    if (!newMessage.guild || !newMessage.author || newMessage.author.bot) return;
    if (oldMessage.content === newMessage.content) return;
    await sendLog(
      newMessage.guild,
      "Mensaje Editado",
      `**Autor:** ${newMessage.author.tag}\n**Canal:** ${newMessage.channel}\n**Antes:** ${oldMessage.content}\n**Después:** ${newMessage.content}`,
      "#FAA61A"
    );
  }
};
