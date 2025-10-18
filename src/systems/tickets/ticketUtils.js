import fs from "fs-extra";
const path = "./src/data/tickets.json";

export async function getTickets() {
  if (!(await fs.pathExists(path))) await fs.writeJson(path, []);
  return await fs.readJson(path);
}

export async function saveTickets(data) {
  await fs.writeJson(path, data, { spaces: 2 });
}
