import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ port?: number; networkMode?: boolean }>(event);

  if (!body?.port || typeof body.port !== "number") {
    throw createError({ statusCode: 400, statusMessage: "Port is required and must be a number" });
  }

  const settings = {
    port: body.port,
    networkMode: body.networkMode ?? false,
    timestamp: new Date().toISOString(),
  };

  console.log("[Settings] New configuration received:", settings);
  console.log("[Settings] Note: Vite dev server requires a manual restart to apply port/host changes.");

  return { success: true, settings };
});