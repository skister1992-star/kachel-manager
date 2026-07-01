import { defineHandler } from "nitro";
import { readBody } from "nitro/h3";
import fs from "node:fs/promises";

const DATA_FILE = "./data/kachels.json";

export default defineHandler(async (event) => {
  const body = await readBody<{ title?: string; url?: string; image?: string }>(event);

  if (!body?.title || !body?.url) {
    return { success: false, error: "Title and URL are required" };
  }

  let kachels: any[] = [];
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    kachels = JSON.parse(raw);
  } catch {}

  const newItem = { id: `k-${Date.now()}`, title: body.title.trim(), url: body.url.trim(), image: body.image?.trim() || "" };
  kachels.push(newItem);

  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(kachels, null, 2));
  } catch {}

  return { success: true, data: newItem };
});