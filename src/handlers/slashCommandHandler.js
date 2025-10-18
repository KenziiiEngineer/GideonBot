import fs from "fs";
import path from "path";
import { logWithTime } from "../utils/logger.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (client) => {
  const slashCommands = [];

  const commandFolders = fs.readdirSync(path.join(__dirname, "../commands"));
  for (const folder of commandFolders) {
    const commandFiles = fs
      .readdirSync(path.join(__dirname, "../commands", folder))
      .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
      import(`../commands/${folder}/${file}`).then(command => {
        if (command.default?.data) slashCommands.push(command.default.data.toJSON());
      });
    }
  }

  client.slashCommands = slashCommands;
  logWithTime("✅ Slash commands cargados correctamente.");
};
