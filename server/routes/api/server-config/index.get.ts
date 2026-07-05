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

  // Read actual running values from environment variables set by Vite/Nitro
  const nitroHost = process.env.NITRO_HOST || "127.0.0.1";
  const nitroPort = Number(process.env.NITRO_PORT) || (savedConfig?.port ? Number(savedConfig.port) : 8080);

  // The host mode is determined by whether NITRO_HOST is set to "::" or "0.0.0.0"
  const isNetworkMode = nitroHost === "::" || nitroHost === "0.0.0.0";

  return {
    // What's currently running (from environment)
    running: {
      hostMode: isNetworkMode ? "network" : "local",
      host: isNetworkMode ? "*" : nitroHost,
      port: nitroPort,
    },
    // What will be used on restart (from JSON file)
    saved: savedConfig ? {
      hostMode: savedConfig.hostMode || "local",
      host: savedConfig.networkMode ? "::" : "127.0.0.1",
      port: Number(savedConfig.port) || 8080,
      allowedHosts: savedConfig.allowedHosts || "",
    } : null,
    lanIp: null,
  };
});