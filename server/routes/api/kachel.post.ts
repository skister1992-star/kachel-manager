import { defineHandler } from "nitro";
import { readBody } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ title?: string; url?: string; image?: string }>(event);
  
  // In a real implementation, this would save to persistent storage
  return { 
    success: true,
    id: "new-id",
    data: body
  };
});