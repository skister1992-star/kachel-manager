import { defineHandler } from "nitro";
import { readBody } from "nitro/h3";
import fs from "node:fs/promises";

const DATA_FILE = "./data/kachels.json";

export default defineHandler(async (event) => {
  const body = await readBody<{ id?: string }>(event);

  if (!body?.id) {
    return { success: false, error: "ID is required" };
  }

  let kachels: any[] = [];
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    kachels = JSON.parse(raw);
  } catch {}

  kachels = kachels.filter((k) => k.id !== body.id);

  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(kachels, null, 2));
  } catch {}

  return { success: true };
});