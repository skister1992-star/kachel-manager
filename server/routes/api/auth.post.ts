import { defineHandler } from "nitro";
import { readBody, setResponseStatus } from "nitro/h3";
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

export default defineHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event);

  if (!body?.username || !body?.password) {
    setResponseStatus(event, 400, "Username and password required");
    return { error: "Username and password required" };
  }

  const stored = loadCredentials();

  if (body.username === stored.username && body.password === stored.password) {
    return { authenticated: true, username: body.username };
  }

  setResponseStatus(event, 401, "Invalid credentials");
  return { error: "Wrong username or password" };
});