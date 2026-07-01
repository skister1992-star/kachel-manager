import { defineHandler } from "nitro";
import fs from "node:fs";
import { validateUser, loadCredentials } from "./utils/auth";

export default defineHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event);
  
  if (!body?.username || !body?.password) {
    return { authenticated: false, error: "Username and password required" };
  }
  
  const { username, password } = body;
  
  // Validate credentials
  if (validateUser(username, password)) {
    return { 
      authenticated: true, 
      username,
      message: "Authentication successful"
    };
  }
  
  return { 
    authenticated: false, 
    error: "Invalid credentials" 
  };
});