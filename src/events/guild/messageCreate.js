import { Events } from "discord.js";

export default {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const prefix = "!";
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(message, args);
    } catch (error) {
      console.error("❌ Error ejecutando comando:", error);
      await message.reply("Hubo un error ejecutando el comando.");
    }
  },
};
