import { defineHandler } from "nitro";
import { readBody } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event);
  
  if (!body?.username || !body?.password) {
    return { authenticated: false, error: "Username and password required" };
  }
  
  // In a real app, this would validate against config file
  const { username, password } = body;
  
  // Mock authentication - in reality, we'd check against stored credentials
  if (username === "admin" && password === "password") {
    return { authenticated: true, username };
  }
  
  return { authenticated: false, error: "Invalid credentials" };
});