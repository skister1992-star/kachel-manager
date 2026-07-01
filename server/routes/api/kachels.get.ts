import { defineHandler } from "nitro";
import fs from "node:fs";
import { loadKachelData } from "./utils/kachel-data";

export default defineHandler(async (event) => {
  try {
    const kachels = loadKachelData();
    return kachels;
  } catch (error) {
    console.error("Failed to get Kachel data:", error);
    return { error: "Failed to load Kachel items" };
  }
});