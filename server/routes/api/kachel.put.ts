import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";
import { updateKachel } from "../utils/kachel-data";

export default defineHandler(async (event) => {
  const body = await readBody<{ id?: string; title?: string; url?: string; image?: string }>(event);

  if (!body?.id) {
    throw createError({ statusCode: 400, statusMessage: "ID is required to update" });
  }

  const updatedItem = {
    id: body.id,
    title: body.title?.trim(),
    url: body.url?.trim(),
    image: body.image?.trim() || "",
  };

  if (!updateKachel(body.id, updatedItem)) {
    throw createError({ statusCode: 404, statusMessage: "Kachel not found" });
  }

  return { success: true, data: updatedItem };
});