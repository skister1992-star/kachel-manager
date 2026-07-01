import { defineHandler } from "nitro";

const MOCK_DATA = [
  { id: "k-1", title: "Sample Chicle 1", url: "https://example.com/1", image: "/images/sample.png" },
  { id: "k-2", title: "Sample Chicle 2", url: "https://example.com/2", image: "/images/sample2.png" }
];

export default defineHandler(async () => {
  try {
    // In a real app, this would read from persistent storage
    return MOCK_DATA;
  } catch (error) {
    console.error("Failed to get Kachel data:", error);
    return { error: "Failed to load Kachel items" };
  }
});