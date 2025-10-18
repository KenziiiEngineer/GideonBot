import { sendLog } from "../../systems/logs/logManager.js";

export default {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isCommand()) return;
    await sendLog(
      interaction.guild,
      "Comando Ejecutado",
      `🧠 **${interaction.user.tag}** ejecutó el comando **/${interaction.commandName}**`,
      "#5865F2"
    );
  }
};
