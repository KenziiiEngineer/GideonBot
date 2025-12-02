import { ActivityType } from "discord.js";
import { autoGiveawayManager } from "../../systems/giveaways/autoEnd.js";

export default {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`✅ Sesión iniciada como ${client.user.tag}`);
    client.user.setActivity("Studio Oficial de CCG2", { type: ActivityType.Watching });

    // Iniciar el gestor automático de sorteos (cierra sorteos y notifica ganadores)
    try {
      autoGiveawayManager(client);
      console.log("🔁 AutoGiveawayManager iniciado.");
    } catch (err) {
      console.error("❌ Error iniciando AutoGiveawayManager:", err);
    }
  }
};
