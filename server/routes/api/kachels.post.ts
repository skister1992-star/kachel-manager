import { defineHandler } from "nitro";
import fs from "node:fs"; 
import { readBody } from "nitro/h3";
import { saveKachelData, loadKachelData } from "./utils/kachel-data";

export default defineHandler(async (event) => {
  const body = await readBody<{ title?: string; url?: string; image?: string }>(event);
  
  if (!body?.title || !body?.url) {
    return { error: "Title and URL are required" };
  }
  
  try {
    // Load existing data
    let kachels = loadKachelData();
    
    // Create new item with unique ID
    const newItem = {
      id: `k-${Date.now()}`,
      title: body.title,
      url: body.url, 
      image: body.image || "/images/default.png"
    };
    
    // Add to list and save back
    kachels.push(newItem);
    if (saveKachelData(kachels)) {
      return { success: true, item: newItem };
    } else {
      return { error: "Failed to save new Kachel item" };
    }
  } catch (error) {
    console.error("Failed to create Kachel:", error);
    return { error: "Failed to create Kachel item" };
  }
});