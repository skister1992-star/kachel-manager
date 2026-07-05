import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { nitro } from "nitro/vite";

const settingsPath = "./data/server-settings.json";
let serverSettings = { port: 32122, host: "::", allowedHosts: [] as string[] };

try {
  if (fs.existsSync(settingsPath)) {
    const parsed = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    serverSettings.port = typeof parsed.port === "number" ? parsed.port : 32122;

    // Use network mode host if enabled
    if (parsed.networkMode) {
      serverSettings.host = "::";
    } else {
      serverSettings.host = "127.0.0.1";
    }

    if (parsed.allowedHosts && typeof parsed.allowedHosts === "string") {
      serverSettings.allowedHosts = parsed.allowedHosts.split(",").map((h: string) => h.trim()).filter(Boolean);
    } else if (Array.isArray(parsed.allowedHosts)) {
      serverSettings.allowedHosts = parsed.allowedHosts.filter(Boolean);
    }
  }
} catch {}

console.log(`[vite.config] Server will start on ${serverSettings.host}:${serverSettings.port}`);
console.log(`[vite.config] Allowed hosts:`, serverSettings.allowedHosts);

export default defineConfig(() => ({
  server: {
    host: serverSettings.host,
    port: serverSettings.port,
    allowedHosts: serverSettings.allowedHosts,
    fs: {
      allow: ["."], // Allow serving files from project root including /data/uploads/
    },
  },
  plugins: [dyadComponentTagger(), react(), nitro()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));