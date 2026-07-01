import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ id?: string; title?: string; url?: string; image?: string }>(event);

  if (!body?.id) {
    throw createError({ statusCode: 400, statusMessage: "ID is required to update" });
  }

  // In a real app, this would update persistent storage
  const updatedItem = {
    id: body.id,
    title: body.title?.trim(),
    url: body.url?.trim(),
    image: body.image?.trim() || ""
  };

  console.log("Updated Kachel:", updatedItem);
  
  return { success: true, data: updatedItem };
});