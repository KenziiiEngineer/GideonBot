import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, "../../config.json");

function getConfig() {
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function saveConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

export function setAutoRole(roleId) {
  const data = getConfig();
  data.autorole.rol = roleId;
  saveConfig(data);
}

export function getAutoRole() {
  const data = getConfig();
  return data.autorole.rol || null;
}
