import assert from "node:assert/strict";
import { test } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";

function createTestApp(result = {
  answer: "The selected region is associated with the prediction.",
  limitations: ["This is model evidence, not proof."]
}) {
  const calls = [];
  const explainer = {
    async explain(input) {
      calls.push(input);
      return result;
    }
  };
  return { app: createApp({ explainer, maxFileSizeBytes: 100, maxFiles: 2 }), calls };
}

test("allows the React origin to preflight JSON requests", async () => {
  const { app } = createTestApp();
  const response = await request(app)
    .options("/v1/explain")
    .set("Origin", "http://localhost:3000")
    .set("Access-Control-Request-Method", "POST")
    .set("Access-Control-Request-Headers", "content-type");

  assert.equal(response.status, 204);
  assert.equal(response.headers["access-control-allow-origin"], "http://localhost:3000");
  assert.equal(response.headers["access-control-allow-methods"], "POST, OPTIONS");
});

test("accepts a text-only JSON explanation request", async () => {
  const { app, calls } = createTestApp({ answer: "Text answer", limitations: [] });
  const payload = {
    context: {
      artifact: {
        kind: "tokens",
        selection: { start: 2, end: 4 },
        structuredData: { tokens: [{ token: "hello", probability: 0.8 }] }
      },
      model: { name: "GPT-2", task: "text_to_text" }
    },
    question: "Why was this token selected?",
    expertiseLevel: "intermediate"
  };

  const response = await request(app).post("/v1/explain").send(payload);

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { answer: "Text answer", limitations: [] });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].attachments.length, 0);
  assert.equal(calls[0].question, payload.question);
});

test("accepts image attachments with role metadata", async () => {
  const { app, calls } = createTestApp();
  const response = await request(app)
    .post("/v1/explain")
    .field("context", JSON.stringify({
      artifact: { kind: "classification", selection: { classIndex: 1 } },
      existingXai: { method: "grad_cam" }
    }))
    .field("question", "Why was this class ranked highest?")
    .field("expertiseLevel", "beginner")
    .field("attachmentMetadata", JSON.stringify([
      { role: "original_input", mimeType: "image/png", description: "Original image" }
    ]))
    .attach("attachments", Buffer.from("png-bytes"), {
      filename: "input.png",
      contentType: "image/png"
    });

  assert.equal(response.status, 200);
  assert.equal(calls[0].attachments.length, 1);
  assert.equal(calls[0].attachments[0].mimetype, "image/png");
  assert.equal(calls[0].attachmentMetadata[0].role, "original_input");
});

test("accepts a Grad-CAM focus mask attachment role", async () => {
  const { app } = createTestApp();
  const response = await request(app)
    .post("/v1/explain")
    .field("context", JSON.stringify({ artifact: { kind: "classification_gradcam" } }))
    .field("question", "What do these visual explanations tell me about this prediction?")
    .field("expertiseLevel", "beginner")
    .field("attachmentMetadata", JSON.stringify([
      { role: "focus_mask", mimeType: "image/png", description: "Grad-CAM focus mask" }
    ]))
    .attach("attachments", Buffer.from("png-bytes"), {
      filename: "focus-mask.png",
      contentType: "image/png"
    });

  assert.equal(response.status, 200);
});

test("accepts a rendered spectrogram attachment role", async () => {
  const { app, calls } = createTestApp();
  const response = await request(app)
    .post("/v1/explain")
    .field("context", JSON.stringify({
      artifact: {
        kind: "spectrogram_segment",
        selection: { speaker: "SPEAKER_00", startTime: 4.88, endTime: 9.9 }
      }
    }))
    .field("question", "What am I looking at?")
    .field("expertiseLevel", "beginner")
    .field("attachmentMetadata", JSON.stringify([
      { role: "spectrogram", mimeType: "image/png", description: "Rendered segment spectrogram" }
    ]))
    .attach("attachments", Buffer.from("png-bytes"), {
      filename: "spectrogram.png",
      contentType: "image/png"
    });

  assert.equal(response.status, 200);
  assert.equal(calls[0].attachmentMetadata[0].role, "spectrogram");
  assert.equal(calls[0].attachments[0].mimetype, "image/png");
});

test("rejects invalid expertise levels", async () => {
  const { app } = createTestApp();
  const response = await request(app).post("/v1/explain").send({
    context: { artifact: { kind: "text" } },
    question: "Explain this",
    expertiseLevel: "wizard"
  });

  assert.equal(response.status, 400);
  assert.match(response.body.error, /expertiseLevel/);
});

test("rejects attachments without matching metadata", async () => {
  const { app } = createTestApp();
  const response = await request(app)
    .post("/v1/explain")
    .field("context", JSON.stringify({ artifact: { kind: "image" } }))
    .field("question", "Explain this image")
    .field("expertiseLevel", "beginner")
    .attach("attachments", Buffer.from("png-bytes"), {
      filename: "input.png",
      contentType: "image/png"
    });

  assert.equal(response.status, 400);
  assert.match(response.body.error, /attachmentMetadata/);
});

test("rejects non-image attachments and oversized files", async (t) => {
  await t.test("non-image", async () => {
    const { app } = createTestApp();
    const response = await request(app)
      .post("/v1/explain")
      .field("context", JSON.stringify({ artifact: { kind: "audio" } }))
      .field("question", "Explain this")
      .field("expertiseLevel", "expert")
      .field("attachmentMetadata", JSON.stringify([
        { role: "visualization", mimeType: "image/png" }
      ]))
      .attach("attachments", Buffer.from("audio"), {
        filename: "audio.wav",
        contentType: "audio/wav"
      });

    assert.equal(response.status, 400);
  });

  await t.test("oversized", async () => {
    const { app } = createTestApp();
    const response = await request(app)
      .post("/v1/explain")
      .field("context", JSON.stringify({ artifact: { kind: "image" } }))
      .field("question", "Explain this")
      .field("expertiseLevel", "expert")
      .field("attachmentMetadata", JSON.stringify([
        { role: "original_input", mimeType: "image/png" }
      ]))
      .attach("attachments", Buffer.alloc(101), {
        filename: "large.png",
        contentType: "image/png"
      });

    assert.equal(response.status, 400);
    assert.match(response.body.error, /maximum size/);
  });
});
