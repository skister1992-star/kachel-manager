import { defineHandler } from "nitro";
import fs from "node:fs/promises";
import path from "node:path";

const DATA_FILE = "./data/kachels.json";

export default defineHandler(async () => {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    // Return empty array if file doesn't exist yet
    return [];
  }
});