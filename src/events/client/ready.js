export default {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`✅ Sesión iniciada como ${client.user.tag}`);
    client.user.setActivity("Gideon Studio", { type: 3 });
  }
};
