import assert from "node:assert/strict";
import { test } from "node:test";
import { createOpenAICompatibleExplainer } from "../src/openAICompatibleClient.js";

const input = {
  context: { artifact: { kind: "classification" } },
  question: "What is highlighted?",
  expertiseLevel: "beginner",
  attachmentMetadata: [{ role: "heatmap", mimeType: "image/png" }],
  attachments: [{ mimetype: "image/png", buffer: Buffer.from("image") }]
};

test("sends multimodal requests to an OpenAI-compatible endpoint without requiring a key", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({
      choices: [{
        message: {
          content: "```json\n{\"answer\":\"Highlighted area\",\"limitations\":[\"one\",\"two\",\"three\"]}\n```"
        }
      }]
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  const explainer = createOpenAICompatibleExplainer({
    baseUrl: "http://127.0.0.1:8000/v1/",
    model: "local-vlm",
    providerName: "vLLM",
    fetchImpl
  });

  const result = await explainer.explain(input);

  assert.deepEqual(result, {
    answer: "Highlighted area",
    limitations: ["one", "two"]
  });
  assert.equal(calls[0].url, "http://127.0.0.1:8000/v1/chat/completions");
  assert.equal(calls[0].options.headers.Authorization, undefined);

  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.model, "local-vlm");
  assert.equal(body.response_format.type, "json_schema");
  assert.equal(body.messages[0].content[1].type, "image_url");
  assert.match(body.messages[0].content[1].image_url.url, /^data:image\/png;base64,/);
});

test("uses bearer authentication and can disable response_format", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({
      choices: [{ message: { content: "{\"answer\":\"answer\",\"limitations\":[]}" } }]
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  const explainer = createOpenAICompatibleExplainer({
    apiKey: "test-key",
    baseUrl: "https://example.test/v1/chat/completions",
    model: "hosted-vlm",
    responseFormat: "none",
    fetchImpl
  });

  await explainer.explain({ ...input, attachments: [], attachmentMetadata: [] });

  assert.equal(calls[0].url, "https://example.test/v1/chat/completions");
  assert.equal(calls[0].options.headers.Authorization, "Bearer test-key");
  assert.equal(JSON.parse(calls[0].options.body).response_format, undefined);
});

test("turns upstream HTTP failures into 502 errors", async () => {
  const explainer = createOpenAICompatibleExplainer({
    baseUrl: "http://localhost:8000/v1",
    model: "local-vlm",
    fetchImpl: async () => new Response("model unavailable", { status: 503 })
  });

  await assert.rejects(
    explainer.explain({ ...input, attachments: [], attachmentMetadata: [] }),
    (error) => error.statusCode === 502 && /503.*model unavailable/.test(error.message)
  );
});
