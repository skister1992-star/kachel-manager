import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { nitro } from "nitro/vite";

const settingsPath = "./data/server-settings.json";
let serverSettings = { port: 8080, host: "::" };

try {
  if (fs.existsSync(settingsPath)) {
    const parsed = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    serverSettings.port = typeof parsed.port === "number" ? parsed.port : 8080;
    serverSettings.host = parsed.networkMode ? "::" : "127.0.0.1";
  }
} catch {}

console.log(`[vite.config] Server will start on ${serverSettings.host}:${serverSettings.port}`);

export default defineConfig(() => ({
  server: {
    host: serverSettings.host,
    port: serverSettings.port,
  },
  plugins: [dyadComponentTagger(), react(), nitro()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));