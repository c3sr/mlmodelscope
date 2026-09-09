import { createGeminiExplainer } from "./geminiClient.js";
import { createOpenAICompatibleExplainer } from "./openAICompatibleClient.js";

export function createExplainerFromEnv(env = process.env, { fetchImpl = globalThis.fetch } = {}) {
  const provider = normalizeProvider(env.EXPLANATION_PROVIDER || "gemini");

  if (provider === "gemini") {
    return createGeminiExplainer({
      apiKey: env.EXPLANATION_API_KEY || env.GEMINI_API_KEY,
      model: env.EXPLANATION_MODEL || env.GEMINI_MODEL || "gemini-3.6-flash"
    });
  }

  if (provider === "openai") {
    const apiKey = env.EXPLANATION_API_KEY || env.OPENAI_API_KEY;
    if (!apiKey)
      throw new Error("OPENAI_API_KEY or EXPLANATION_API_KEY is required for the OpenAI provider");

    return createOpenAICompatibleExplainer({
      apiKey,
      baseUrl: env.EXPLANATION_BASE_URL || env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      model: env.EXPLANATION_MODEL || env.OPENAI_MODEL || "gpt-4.1-mini",
      providerName: "OpenAI",
      responseFormat: env.EXPLANATION_RESPONSE_FORMAT || "json_schema",
      fetchImpl
    });
  }

  if (provider === "vllm" || provider === "openai-compatible") {
    return createOpenAICompatibleExplainer({
      apiKey: env.EXPLANATION_API_KEY || env.VLLM_API_KEY,
      baseUrl: env.EXPLANATION_BASE_URL || env.VLLM_BASE_URL || "http://127.0.0.1:8000/v1",
      model: env.EXPLANATION_MODEL || env.VLLM_MODEL,
      providerName: provider === "vllm" ? "vLLM" : "OpenAI-compatible model",
      responseFormat: env.EXPLANATION_RESPONSE_FORMAT || "json_schema",
      fetchImpl
    });
  }

  throw new Error(
    `Unsupported EXPLANATION_PROVIDER "${env.EXPLANATION_PROVIDER}"; use gemini, openai, vllm, or openai-compatible`
  );
}

function normalizeProvider(provider) {
  return provider.trim().toLowerCase().replaceAll("_", "-");
}
