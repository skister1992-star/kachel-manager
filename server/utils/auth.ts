import fs from "node:fs";

const CREDENTIALS_FILE = "./data/credentials.json";

function loadCredentials() {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, "utf-8"));
    }
  } catch {}
  // Default fallback credentials
  return { username: "admin", password: "admin" };
}

export const validateUser = (username: string, password: string) => {
  const stored = loadCredentials();
  return username === stored.username && password === stored.password;
};

export const getCredentials = () => {
  return loadCredentials();
};

export const saveCredentials = (username: string, password: string) => {
  try {
    const dataDir = "./data";
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify({ username, password }, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to save credentials:", error);
    return false;
  }
};