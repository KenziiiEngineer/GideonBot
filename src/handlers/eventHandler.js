import fs from "fs";
import path from "path";
import { logWithTime } from "../utils/logger.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (client) => {
  const eventFolders = fs.readdirSync(path.join(__dirname, "../events"));

  for (const folder of eventFolders) {
    const eventFiles = fs
      .readdirSync(path.join(__dirname, "../events", folder))
      .filter(file => file.endsWith(".js"));

    for (const file of eventFiles) {
      import(`../events/${folder}/${file}`).then(event => {
        const evt = event.default;
        if (evt?.name && typeof evt.execute === "function") {
          client.on(evt.name, (...args) => evt.execute(...args, client));
          logWithTime(`⚙️ Evento cargado: ${evt.name}`);
        }
      }).catch(err => logWithTime(`❌ Error cargando evento ${file}: ${err.message}`));
    }
  }
};
