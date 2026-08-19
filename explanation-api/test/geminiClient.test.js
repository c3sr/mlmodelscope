import assert from "node:assert/strict";
import { test } from "node:test";
import { parseGeminiResponse } from "../src/geminiClient.js";

const responseText = JSON.stringify({
  answer: "The highlighted region overlaps the subject in the image.",
  limitations: [
    "The map does not identify the exact feature recognized.",
    "The visualization does not prove the prediction is correct.",
    "The target layer produces a coarse attribution map."
  ]
});

test("caps beginner limitations at the two most important items", () => {
  const result = parseGeminiResponse(responseText, "beginner");

  assert.deepEqual(result.limitations, [
    "The map does not identify the exact feature recognized.",
    "The visualization does not prove the prediction is correct."
  ]);
});

test("preserves full limitations for intermediate and expert responses", () => {
  assert.equal(parseGeminiResponse(responseText, "intermediate").limitations.length, 3);
  assert.equal(parseGeminiResponse(responseText, "expert").limitations.length, 3);
});
