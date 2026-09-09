import { parseExplanationResponse } from "./explanationResponse.js";
import { buildExplanationPrompt } from "./prompt.js";

const explanationSchema = {
  type: "object",
  properties: {
    answer: { type: "string" },
    limitations: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["answer", "limitations"],
  additionalProperties: false
};

export function createOpenAICompatibleExplainer({
  apiKey,
  baseUrl,
  model,
  providerName = "OpenAI-compatible model",
  responseFormat = "json_schema",
  fetchImpl = globalThis.fetch
} = {}) {
  if (!baseUrl)
    throw new Error("An OpenAI-compatible base URL is required");
  if (!model)
    throw new Error("An OpenAI-compatible model is required");
  if (typeof fetchImpl !== "function")
    throw new Error("A fetch implementation is required");
  if (!["json_schema", "json_object", "none"].includes(responseFormat))
    throw new Error("EXPLANATION_RESPONSE_FORMAT must be json_schema, json_object, or none");

  const endpoint = chatCompletionsUrl(baseUrl);

  return {
    model,
    async explain({ context, question, expertiseLevel, attachmentMetadata, attachments }) {
      const prompt = [
        buildExplanationPrompt({ context, question, expertiseLevel, attachmentMetadata }),
        "",
        "Return only JSON with this shape: {\"answer\": \"...\", \"limitations\": [\"...\"]}."
      ].join("\n");
      const content = [{ type: "text", text: prompt }];

      attachments.forEach((attachment) => {
        content.push({
          type: "image_url",
          image_url: {
            url: `data:${attachment.mimetype};base64,${attachment.buffer.toString("base64")}`
          }
        });
      });

      const body = {
        model,
        messages: [{ role: "user", content }]
      };
      const format = buildResponseFormat(responseFormat);
      if (format)
        body.response_format = format;

      let response;
      try {
        response = await fetchImpl(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
          },
          body: JSON.stringify(body)
        });
      } catch (error) {
        throw upstreamError(`${providerName} request failed`, error);
      }

      if (!response.ok) {
        const detail = await safeErrorText(response);
        throw upstreamError(
          `${providerName} request failed with status ${response.status}${detail ? `: ${detail}` : ""}`
        );
      }

      let payload;
      try {
        payload = await response.json();
      } catch (error) {
        throw upstreamError(`${providerName} returned an invalid HTTP response`, error);
      }

      const text = payload?.choices?.[0]?.message?.content;
      return parseExplanationResponse(text, expertiseLevel, providerName);
    }
  };
}

function chatCompletionsUrl(baseUrl) {
  const normalized = baseUrl.replace(/\/+$/, "");
  return normalized.endsWith("/chat/completions")
    ? normalized
    : `${normalized}/chat/completions`;
}

function buildResponseFormat(responseFormat) {
  if (responseFormat === "none")
    return undefined;
  if (responseFormat === "json_object")
    return { type: "json_object" };

  return {
    type: "json_schema",
    json_schema: {
      name: "model_explanation",
      strict: true,
      schema: explanationSchema
    }
  };
}

async function safeErrorText(response) {
  try {
    return (await response.text()).slice(0, 500);
  } catch (error) {
    return "";
  }
}

function upstreamError(message, cause) {
  const error = new Error(message);
  error.cause = cause;
  error.statusCode = 502;
  return error;
}
