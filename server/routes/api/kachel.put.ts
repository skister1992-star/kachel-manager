import { defineHandler } from "nitro";
import { readBody } from "nitro/h3";
import fs from "node:fs/promises";

const DATA_FILE = "./data/kachels.json";

export default defineHandler(async (event) => {
  const body = await readBody<{ id?: string; title?: string; url?: string; image?: string }>(event);

  if (!body?.id) {
    return { success: false, error: "ID is required" };
  }

  let kachels: any[] = [];
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    kachels = JSON.parse(raw);
  } catch {}

  const index = kachels.findIndex((k) => k.id === body.id);
  if (index === -1) {
    return { success: false, error: "Kachel not found" };
  }

  if (body.title !== undefined) kachels[index].title = body.title.trim();
  if (body.url !== undefined) kachels[index].url = body.url.trim();
  if (body.image !== undefined) kachels[index].image = body.image?.trim() || "";

  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(kachels, null, 2));
  } catch {}

  return { success: true };
});