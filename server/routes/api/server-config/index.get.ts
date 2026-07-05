import { defineHandler } from "nitro";
import fs from "node:fs";

const SETTINGS_PATH = "./data/server-settings.json";

export default defineHandler(async () => {
  let savedConfig = null;

  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      savedConfig = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));
    }
  } catch (error) {
    console.error("Failed to read server settings:", error);
  }

  return {
    // What's currently running — same as what will be used on restart (Vite reads this file at startup)
    running: savedConfig ? {
      hostMode: savedConfig.hostMode || "local",
      host: savedConfig.networkMode ? "::" : "127.0.0.1",
      port: Number(savedConfig.port) || 8080,
    } : null,
    // What will be used on restart (from JSON file) — same as running since Vite reads this at startup
    saved: savedConfig ? {
      hostMode: savedConfig.hostMode || "local",
      host: savedConfig.networkMode ? "::" : "127.0.0.1",
      port: Number(savedConfig.port) || 8080,
      allowedHosts: savedConfig.allowedHosts || "",
    } : null,
    lanIp: null,
  };
});