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

  const hostMode = process.env.NITRO_HOST === "::" ? "network" : "local";
  
  return {
    // What's currently running
    running: {
      hostMode,
      host: process.env.NITRO_HOST || "127.0.0.1",
      port: Number(process.env.NITRO_PORT) || 3000,
    },
    // What will be used on restart (from JSON file)
    saved: savedConfig ? {
      hostMode: savedConfig.hostMode || "local",
      host: savedConfig.networkMode ? "::" : "127.0.0.1",
      port: Number(savedConfig.port) || 3000,
      allowedHosts: savedConfig.allowedHosts || "",
    } : null,
    lanIp: null,
  };
});