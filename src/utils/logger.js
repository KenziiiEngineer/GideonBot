// Función auxiliar para logs con timestamp
function logWithTime(message) {
    console.log(`[${new Date().toLocaleString()}] ${message}`);
}

module.exports = { logWithTime };
