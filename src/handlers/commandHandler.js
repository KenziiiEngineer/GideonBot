import fs from "fs";
import path from "path";
import chalk from "chalk";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 📦 Carga todos los comandos del bot (totalmente compatible con Windows y rutas con espacios)
 */
export default async function loadCommands(client) {
  const foldersPath = path.join(__dirname, "../commands");

  if (!fs.existsSync(foldersPath)) {
    console.log(chalk.red("❌ No se encontró la carpeta de comandos."));
    return;
  }

  const folders = fs.readdirSync(foldersPath);
  let count = 0;

  for (const folder of folders) {
    const folderPath = path.join(foldersPath, folder);

    // 📁 Solo procesar carpetas
    if (!fs.lstatSync(folderPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);

      try {
        // ⚡ Convertimos la ruta a URL válida (soporta espacios)
        const commandModule = await import(pathToFileURL(filePath).href);
        const command = commandModule.default;

        if (command?.data && command?.execute) {
          client.commands.set(command.data.name, command);
          console.log(chalk.greenBright(`✅ Comando cargado: ${command.data.name}`));
          count++;
        } else {
          console.log(chalk.yellow(`⚠️ El archivo ${file} no tiene data o execute válidos.`));
        }
      } catch (err) {
        console.error(chalk.red(`❌ Error al cargar comando ${file}: ${err.message}`));
      }
    }
  }

  console.log(chalk.cyanBright(`📂 Total de comandos cargados: ${count}`));
}
