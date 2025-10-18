export function logWithTime(message) {
  const date = new Date().toLocaleString("es-MX", { hour12: false });
  console.log(`[${date}] ${message}`);
}
