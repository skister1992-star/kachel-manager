import { defineHandler } from "nitro";

export default defineHandler(async () => {
  return { username: "admin", password: "123we456" };
});