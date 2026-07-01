import { defineHandler } from "nitro";
import fs from "node:fs"; 
import { readBody } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ title?: string; url?: string; image?: string }>(event);
  
  if (!body?.title || !body?.url) {
    return { error: "Title and URL are required" };
  }
  
  try {
    // In a real app, this would save to persistent storage
    const newItem = {
      id: `k-${Date.now()}`,
      title: body.title,
      url: body.url, 
      image: body.image || "/images/default.png"
    };
    
    return { success: true, item: newItem };
  } catch (error) {
    console.error("Failed to create Kachel:", error);
    return { error: "Failed to create Kachel item" };
  }
});