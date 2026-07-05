import { defineHandler } from "nitro";
import fs from "node:fs";
import path from "path";

const UPLOADS_DIR = "./data/uploads";

function ensureDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export default defineHandler(async (event) => {
  const formData = await event.req?.formData();

  if (!formData || !(formData instanceof FormData)) {
    return { error: "No file uploaded" };
  }

  const file = formData.get("file");
  if (!(file instanceof Blob) || !file.type.startsWith("image/")) {
    return { error: "Only image files are allowed" };
  }

  ensureDir();

  // Generate a unique filename
  const ext = path.extname(file.name).toLowerCase() || ".png";
  const fileName = `kachel-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  // Write file to disk
  const buffer = Buffer.from(await (file as Blob).arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  // Return the URL that can be accessed from the frontend
  return { success: true, url: `/data/uploads/${fileName}` };
});