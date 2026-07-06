import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";
import { addKachel } from "../../utils/kachel-data";

export default defineHandler(async (event) => {
  const body = await readBody<{ 
    title?: string; 
    url?: string; 
    image?: string; 
    imgPositionX?: number; 
    imgPositionY?: number; 
    imgRotation?: number; 
    imgFitMode?: string;
  }>(event);

  if (!body?.title || !body?.url) {
    throw createError({ statusCode: 400, statusMessage: "Title and URL are required" });
  }

  const newItem = {
    id: `k-${Date.now()}`,
    title: body.title.trim(),
    url: body.url.trim(),
    image: body.image?.trim() || "",
    imgPositionX: typeof body.imgPositionX === "number" ? body.imgPositionX : 0,
    imgPositionY: typeof body.imgPositionY === "number" ? body.imgPositionY : 0,
    imgRotation: typeof body.imgRotation === "number" ? body.imgRotation : 0,
    imgFitMode: body.imgFitMode || "fill",
  };

  if (!addKachel(newItem)) {
    throw createError({ statusCode: 500, statusMessage: "Failed to save Kachel" });
  }

  return { success: true, data: newItem };
});