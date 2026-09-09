import assert from "node:assert/strict";
import { test } from "node:test";
import { createExplainerFromEnv } from "../src/explainerFactory.js";

test("creates a keyless vLLM explainer from generic configuration", () => {
  const explainer = createExplainerFromEnv({
    EXPLANATION_PROVIDER: "vllm",
    EXPLANATION_MODEL: "local-vlm",
    EXPLANATION_BASE_URL: "http://localhost:8000/v1"
  });

  assert.equal(explainer.model, "local-vlm");
  assert.equal(typeof explainer.explain, "function");
});

test("supports the openai_compatible provider alias", () => {
  const explainer = createExplainerFromEnv({
    EXPLANATION_PROVIDER: "openai_compatible",
    EXPLANATION_MODEL: "remote-vlm",
    EXPLANATION_BASE_URL: "https://provider.test/v1"
  });

  assert.equal(explainer.model, "remote-vlm");
});

test("requires an API key for OpenAI", () => {
  assert.throws(
    () => createExplainerFromEnv({ EXPLANATION_PROVIDER: "openai" }),
    /OPENAI_API_KEY/
  );
});

test("rejects unknown providers", () => {
  assert.throws(
    () => createExplainerFromEnv({ EXPLANATION_PROVIDER: "unknown" }),
    /Unsupported EXPLANATION_PROVIDER/
  );
});
