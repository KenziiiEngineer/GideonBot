import { Client, GatewayIntentBits, Collection, REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import chalk from "chalk";
import { logWithTime } from "./utils/logger.js";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.commands = new Collection();

// 🧩 Función: Cargar comandos y enviarlos a Discord automáticamente
async function loadAndRegisterCommands() {
  const commands = [];
  const foldersPath = path.join(__dirname, "./commands");
  const folders = fs.readdirSync(foldersPath);

  for (const folder of folders) {
    const folderPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const { default: command } = await import(`file://${filePath}`);

      if (command?.data && command?.execute) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        console.log(chalk.green(`✅ Comando cargado: ${command.data.name}`));
      } else {
        console.log(chalk.yellow(`⚠️ Archivo inválido: ${file}`));
      }
    }
  }

  // 🔁 Registrar comandos automáticamente en Discord
  try {
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    console.log(chalk.blue("📡 Registrando comandos con Discord..."));
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log(
      chalk.greenBright(`✅ ${commands.length} comandos registrados correctamente.`)
    );
  } catch (error) {
    console.error(chalk.red("❌ Error al registrar comandos:"), error);
  }
}

// 🧠 Cargar eventos
async function loadEvents() {
  const eventsPath = path.join(__dirname, "./events");
  const folders = fs.readdirSync(eventsPath);

  for (const folder of folders) {
    const folderPath = path.join(eventsPath, folder);
    const files = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of files) {
      const { default: event } = await import(`file://${path.join(folderPath, file)}`);
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
      console.log(chalk.blue(`⚙️ Evento cargado: ${event.name}`));
    }
  }
}

// 🌀 Inicializar bot
(async () => {
  console.log(chalk.cyan("🧠 Iniciando GideonBot..."));
  await loadAndRegisterCommands();
  await loadEvents();

  await client.login(process.env.TOKEN);
  logWithTime("✅ Bot iniciado correctamente.");
})();
