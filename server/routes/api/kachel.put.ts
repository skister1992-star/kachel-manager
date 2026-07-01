import { defineHandler } from "nitro";
import { readBody } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ id?: string; title?: string; url?: string; image?: string }>(event);
  
  // In a real implementation, this would update persistent storage
  return { 
    success: true,
    updated: body.id || "unknown"
  };
});