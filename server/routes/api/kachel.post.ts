import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ title?: string; url?: string; image?: string }>(event);

  if (!body?.title || !body?.url) {
    throw createError({ statusCode: 400, statusMessage: "Title and URL are required" });
  }

  // In a real app, this would validate against config file
  const newItem = {
    id: `k-${Date.now()}`,
    title: body.title.trim(),
    url: body.url.trim(),
    image: body.image?.trim() || ""
  };

  console.log("Created new Kachel:", newItem);
  
  return { success: true, data: newItem };
});