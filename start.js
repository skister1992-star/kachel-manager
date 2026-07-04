const fs = require("fs");
const path = require("path");

const settingsPath = path.join(__dirname, "data", "server-settings.json");

let port = 3000;
let host = "127.0.0.1";

try {
  if (fs.existsSync(settingsPath)) {
    const parsed = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    port = typeof parsed.port === "number" ? parsed.port : 3000;
    host = parsed.networkMode ? "::" : "127.0.0.1";
  }
} catch (e) {
  // ignore
}

process.env.NITRO_PORT = String(port);
process.env.NITRO_HOST = host;

console.log(`[start.js] Server will start on ${host}:${port}`);
console.log("[start.js] Change settings in data/server-settings.json and restart for changes to take effect.");

require("./.output/server/index.mjs");