import { defineHandler } from "nitro";
import { loadKachelData } from "../utils/kachel-data";

export default defineHandler(async () => {
  try {
    return loadKachelData();
  } catch (error) {
    console.error("Failed to get Kachel data:", error);
    return [];
  }
});