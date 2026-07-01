import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ id?: string }>(event);

  if (!body?.id) {
    throw createError({ statusCode: 400, statusMessage: "ID is required to delete" });
  }

  // In a real app, this would delete from persistent storage
  console.log("Deleted Kachel:", body.id);
  
  return { success: true };
});