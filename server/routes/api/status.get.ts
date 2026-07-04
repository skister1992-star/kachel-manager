import { defineHandler } from "nitro";

export default defineHandler(async () => {
  const runningPort = process.env.NITRO_PORT || 3000;
  const runningHost = process.env.NITRO_HOST || "127.0.0.1";

  return {
    running: {
      port: Number(runningPort),
      host: runningHost,
      networkMode: runningHost !== "127.0.0.1",
    },
  };
});