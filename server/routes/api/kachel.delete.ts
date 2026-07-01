import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";
import { deleteKachel } from "../utils/kachel-data";

export default defineHandler(async (event) => {
  const body = await readBody<{ id?: string }>(event);

  if (!body?.id) {
    throw createError({ statusCode: 400, statusMessage: "ID is required to delete" });
  }

  if (!deleteKachel(body.id)) {
    throw createError({ statusCode: 500, statusMessage: "Failed to delete Kachel" });
  }

  return { success: true };
});