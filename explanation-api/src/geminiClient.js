import { GoogleGenAI } from "@google/genai";
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
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed.answer !== "string" || !Array.isArray(parsed.limitations))
      throw new Error("Gemini returned an invalid explanation shape");
    const limitations = parsed.limitations.filter((item) => typeof item === "string");
    return {
      answer: parsed.answer,
      limitations: expertiseLevel === "beginner" ? limitations.slice(0, 2) : limitations
    };
  } catch (error) {
    const parseError = new Error("Gemini returned an invalid JSON explanation");
    parseError.cause = error;
    parseError.statusCode = 502;
    throw parseError;
  }
}
