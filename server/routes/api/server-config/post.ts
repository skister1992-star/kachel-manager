import { defineHandler } from "nitro";
import { readBody } from "nitro/h3";
import fs from "node:fs";

const SETTINGS_PATH = "./data/server-settings.json";

export default defineHandler(async (event) => {
  let body;
  
  try {
    body = await readBody<{ hostMode?: string; port?: number }>(event);
    console.log("[server-config POST] Received body:", JSON.stringify(body));
  } catch (err) {
    console.error("[server-config POST] Failed to parse body:", err);
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }

  if (!body?.port || !Number.isFinite(body.port)) {
    console.log("[server-config POST] Invalid port value");
    return new Response(JSON.stringify({ error: "Valid port is required" }), { status: 400 });
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
    console.log("[server-config POST] Saved config:", JSON.stringify(config));

    return new Response(JSON.stringify({ success: true, config }), { status: 200 });
  } catch (error) {
    console.error("[server-config POST] Failed to write config:", error);
    return new Response(JSON.stringify({ error: "Could not save configuration" }), { status: 500 });
  }
});