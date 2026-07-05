import { defineHandler } from "nitro";
import { readBody } from "nitro/h3";
import fs from "node:fs";

const SETTINGS_PATH = "./data/server-settings.json";

export default defineHandler(async (event) => {
  const body = await readBody<{ hostMode?: string; port?: number }>(event);

  if (!body?.port || !Number.isFinite(body.port)) {
    return { error: "Valid port is required" };
  }

  try {
    // Ensure data directory exists
    if (!fs.existsSync("./data")) {
      fs.mkdirSync("./data", { recursive: true });
    }

    const config = {
      hostMode: body.hostMode || "local",
      port: Number(body.port),
      networkMode: body.hostMode === "network",
    };

    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(config, null, 2), "utf-8");

    return {
      success: true,
      config,
    };
  } catch (error) {
    console.error("Failed to save server config:", error);
    return { error: "Could not save configuration" };
  }
});