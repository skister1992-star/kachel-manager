import { defineHandler } from "nitro";

export default defineHandler(async () => {
  const hostMode = process.env.NITRO_HOST === "::" ? "network" : "local";
  return {
    hostMode,
    host: process.env.NITRO_HOST || "127.0.0.1",
    port: Number(process.env.NITRO_PORT) || 3000,
    lanIp: null, // LAN IP detection not available in this environment
  };
});