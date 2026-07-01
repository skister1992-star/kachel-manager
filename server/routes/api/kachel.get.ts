import { defineHandler } from "nitro";
import { readBody } from "nitro/h3";

export default defineHandler(async (event) => {
  // This would read from persistent storage in a real app
  return [
    { id: "1", title: "Sample Chicle 1", url: "https://example.com/1", image: "/images/sample.png" },
    { id: "2", title: "Sample Chicle 2", url: "https://example.com/2", image: "/images/sample2.png" }
  ];
});