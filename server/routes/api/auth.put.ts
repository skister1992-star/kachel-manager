import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";
import fs from "node:fs";

const CREDENTIALS_FILE = "./data/credentials.json";

function saveCredentials(username: string, password: string) {
  const dataDir = "./data";
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify({ username, password }, null, 2), "utf-8");
}

function loadCredentials() {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, "utf-8"));
    }
  } catch {}
  return null;
}

export default defineHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event);

  if (!body?.username || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: "Username and password are required" });
  }

  saveCredentials(body.username.trim(), body.password.trim());

  return { success: true };
});