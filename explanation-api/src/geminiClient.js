import { GoogleGenAI } from "@google/genai";
import { parseExplanationResponse } from "./explanationResponse.js";
import { buildExplanationPrompt } from "./prompt.js";

export function createGeminiExplainer({ apiKey, model = "gemini-3.6-flash" } = {}) {
  if (!apiKey)
    throw new Error("GEMINI_API_KEY is required");

  const client = new GoogleGenAI({ apiKey });

  return {
    model,
    async explain({ context, question, expertiseLevel, attachmentMetadata, attachments }) {
      const parts = [
        { text: buildExplanationPrompt({ context, question, expertiseLevel, attachmentMetadata }) }
      ];

      attachments.forEach((attachment) => {
        parts.push({
          inlineData: {
            mimeType: attachment.mimetype,
            data: attachment.buffer.toString("base64")
          }
        });
      });

      const response = await client.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              answer: { type: "STRING" },
              limitations: {
                type: "ARRAY",
                items: { type: "STRING" }
              }
            },
            required: ["answer", "limitations"]
          }
        }
      });

      return parseGeminiResponse(response.text, expertiseLevel);
    }
  };
}

export function parseGeminiResponse(text, expertiseLevel) {
  return parseExplanationResponse(text, expertiseLevel, "Gemini");
}
