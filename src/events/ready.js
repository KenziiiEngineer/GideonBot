module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Bot listo como ${client.user.tag}`);
        client.user.setPresence({
            activities: [{ name: 'en creación', type: 0 }], // 0 = Playing
            status: 'online'
        });
    }
};
