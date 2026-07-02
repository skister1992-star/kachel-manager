import { defineHandler } from "nitro";
import fs from "node:fs";

const CREDENTIALS_FILE = "./data/credentials.json";

function loadCredentials() {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, "utf-8"));
    }
  } catch {}
  return { username: "admin", password: "123we456" };
}

export default defineHandler(async () => {
  return loadCredentials();
});