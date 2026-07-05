import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";
import fs from "node:fs";

const SETTINGS_PATH = "./data/server-settings.json";

export default defineHandler(async (event) => {
  const body = await readBody<{ hostMode?: string; port?: number; allowedHosts?: string }>(event);

  if (!body?.port || !Number.isFinite(body.port)) {
    throw createError({ statusCode: 400, statusMessage: "Valid port is required" });
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
      allowedHosts: body.allowedHosts || "",
    };

    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(config, null, 2), "utf-8");

    return {
      success: true,
      config,
    };
  } catch (error) {
    console.error("Failed to save server config:", error);
    throw createError({ statusCode: 500, statusMessage: "Could not save configuration" });
  }
});