import { defineHandler } from "nitro";
import fs from "node:fs"; 
import { readBody } from "nitro/h3";
import { saveKachelData, loadKachelData } from "./utils/kachel-data";

export default defineHandler(async (event) => {
  const body = await readBody<{ id?: string; title?: string; url?: string; image?: string }>(event);
  
  if (!body?.id) {
    return { error: "ID is required to update" };
  }
  
  try {
    let kachels = loadKachelData();
    
    const index = kachels.findIndex(k => k.id === body.id);
    if (index === -1) {
      return { error: "Kachel item not found" };
    }
    
    // Update the item
    kachels[index] = {
      ...kachels[index],
      ...(body.title ? { title: body.title } : {}),
      ...(body.url ? { url: body.url } : {}),
      ...(body.image ? { image: body.image } : {})
    };
    
    if (saveKachelData(kachels)) {
      return { success: true, updated: body.id };
    } else {
      return { error: "Failed to update Kachel item" };
    }
  } catch (error) {
    console.error("Failed to update Kachel:", error);
    return { error: "Failed to update Kachel item" };
  }
});