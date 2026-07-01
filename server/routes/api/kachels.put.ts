import { defineHandler } from "nitro";
import fs from "node:fs"; 
import { readBody } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ id?: string; title?: string; url?: string; image?: string }>(event);
  
  if (!body?.id) {
    return { error: "ID is required to update" };
  }
  
  try {
    // In a real app, this would update persistent storage
    return { success: true, updated: body.id };
  } catch (error) {
    console.error("Failed to update Kachel:", error);
    return { error: "Failed to update Kachel item" };
  }
});