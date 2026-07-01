import { useRuntimeConfig } from "nitro";

// This will hold server runtime configuration
export const config = {
  // Authentication credentials (in practice, these would be in a secure config file)
  users: [
    { username: "admin", password: "password" }
  ],
  
  // App settings storage
  appSettings: {
    theme: "light",
    dataDir: "./data"
  }
};

export const getRuntimeConfig = () => useRuntimeConfig();