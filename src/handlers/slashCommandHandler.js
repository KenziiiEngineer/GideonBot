import fs from "fs";
import path from "path";
import { logWithTime } from "../utils/logger.js";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function loadSlashCommands(client) {
  const slashCommands = [];

  const commandFolders = fs.readdirSync(path.join(__dirname, "../commands"));
  for (const folder of commandFolders) {
    const commandFiles = fs
      .readdirSync(path.join(__dirname, "../commands", folder))
      .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(__dirname, "../commands", folder, file);
      try {
        const commandModule = await import(pathToFileURL(filePath).href);
        if (commandModule.default?.data) {
          slashCommands.push(commandModule.default.data.toJSON());
        }
      } catch (err) {
        console.error(`❌ Error al cargar slash command ${file}:`, err);
      }
    }
  }

  client.slashCommands = slashCommands;
  logWithTime("✅ Slash commands cargados correctamente.");
  return slashCommands;
}
