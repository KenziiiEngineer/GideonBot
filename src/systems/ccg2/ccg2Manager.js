import fs from "fs";
import path from "path";
import yaml from "yaml";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 💾 Archivo que guarda TODOS los datos de CCG2
// Jugadores + Canal configurado + Rol asignado
const filePath = path.join(__dirname, "ccg2_players.yml");

// 📌 Ruta de config.json (si se usa en otros comandos)
const configPath = path.join(__dirname, "../../config.json");


// -----------------------------------------------------
// 🔵 Cargar datos desde el archivo YAML
// -----------------------------------------------------
export function loadPlayers() {
  try {
    // Si no existe, crearlo desde cero
    if (!fs.existsSync(filePath)) {
      const emptyData = {
        players: [],
        channel: "",
        roleId: null
      };
      fs.writeFileSync(filePath, yaml.stringify(emptyData));
      return emptyData;
    }

    // Leer archivo
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Si está vacío o corrupto, reiniciar
    if (!fileContent.trim()) {
      const emptyData = {
        players: [],
        channel: "",
        roleId: null
      };
      fs.writeFileSync(filePath, yaml.stringify(emptyData));
      return emptyData;
    }

    // Parsear YAML
    const parsed = yaml.parse(fileContent);

    // Asegurar estructura correcta
    return {
      players: parsed.players || [],
      channel: parsed.channel || "",
      roleId: parsed.roleId || null
    };

  } catch (err) {
    console.error("❌ Error cargando ccg2_players.yml:", err);
    return { players: [], channel: "", roleId: null };
  }
}


// -----------------------------------------------------
// 🔵 Guardar YAML actualizado
// -----------------------------------------------------
export function savePlayers(data) {
  try {
    fs.writeFileSync(filePath, yaml.stringify(data));
  } catch (err) {
    console.error("❌ Error guardando ccg2_players.yml:", err);
  }
}


// -----------------------------------------------------
// 🔵 Añadir jugador (retorna número asignado)
// -----------------------------------------------------
export function addPlayer(nick, userId) {
  const data = loadPlayers();

  if (!data.players) data.players = [];

  // Número incremental automático
  const number = data.players.length + 1;

  data.players.push({
    nick,
    userId,
    number,
    addedAt: Date.now()
  });

  savePlayers(data);
  return number;
}


// -----------------------------------------------------
// 🔵 Guardar canal donde se anuncian jugadores
// -----------------------------------------------------
export function setCCGChannel(channelId) {
  const data = loadPlayers();
  data.channel = channelId;
  savePlayers(data);
}


// -----------------------------------------------------
// 🔵 Obtener canal guardado
// -----------------------------------------------------
export function getCCGChannel() {
  const data = loadPlayers();
  return data.channel || null;
}


// -----------------------------------------------------
// 🔵 Guardar rol de jugadores CCG2
// -----------------------------------------------------
export function setCCGRole(roleId) {
  const data = loadPlayers();
  data.roleId = roleId;
  savePlayers(data);
}


// -----------------------------------------------------
// 🔵 Obtener rol guardado
// -----------------------------------------------------
export function getCCGRole() {
  const data = loadPlayers();
  return data.roleId || null;
}
