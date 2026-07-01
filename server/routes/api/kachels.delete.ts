import { defineHandler } from "nitro";
import fs from "node:fs"; 
import { readBody } from "nitro/h3";
import { saveKachelData, loadKachelData } from "./utils/kachel-data";

export default defineHandler(async (event) => {
  const body = await readBody<{ id?: string }>(event);
  
  if (!body?.id) {
    return { error: "ID is required to delete" };
  }
  
  try {
    let kachels = loadKachelData();
    
    const filtered = kachels.filter(k => k.id !== body.id);
    
    if (filtered.length === kachels.length) {
      return { error: "Kachel item not found" };
    }
    
    if (saveKachelData(filtered)) {
      return { success: true, deleted: body.id };
    } else {
      return { error: "Failed to delete Kachel item" };
    }
  } catch (error) {
    console.error("Failed to delete Kachel:", error);
    return { error: "Failed to delete Kachel item" };
  }
});