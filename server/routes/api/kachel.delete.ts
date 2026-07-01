import { defineHandler } from "nitro";
import { readBody } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ id?: string }>(event);
  
  // In a real implementation, this would delete from persistent storage
  return { 
    success: true,
    deleted: body.id || "unknown"
  };
});