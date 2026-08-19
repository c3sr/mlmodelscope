import assert from "node:assert/strict";
import { test } from "node:test";
import { buildExplanationPrompt } from "../src/prompt.js";

const question = "What do these visual explanations tell me about this prediction?";
const context = {
  artifact: {
    kind: "classification_gradcam",
    selection: { classIndex: 120, label: "fiddler crab", view: "intensity" },
    structuredData: {
      probability: 0.7524,
      logit: 8.4,
      targetLayer: "layer4.-1"
    }
  },
  existingXai: {
    method: "grad_cam",
    targetLayer: "layer4.-1"
  }
};
const attachmentMetadata = [{
  role: "heatmap",
  mimeType: "image/png",
  description: "Grad-CAM intensity map for the selected class"
}];

function promptFor(expertiseLevel) {
  return buildExplanationPrompt({ context, question, expertiseLevel, attachmentMetadata });
}

test("uses the same Grad-CAM evidence and question for every expertise level", () => {
  const prompts = ["beginner", "intermediate", "expert"].map(promptFor);

  prompts.forEach((prompt) => {
    assert.match(prompt, new RegExp(question.replace(/[?]/g, "\\?")));
    assert.match(prompt, /"view": "intensity"/);
    assert.match(prompt, /"targetLayer": "layer4.-1"/);
    assert.match(prompt, /role=heatmap/);
    assert.match(prompt, /Do not upgrade overlap into a claim/i);
    assert.match(prompt, /Selected text and surrounding text are application-presented context/);
    assert.match(prompt, /Token-decision selection fields and alternatives are supplied execution data/);
  });
});

test("grounds token decisions without assuming a decoding procedure", () => {
  const prompt = buildExplanationPrompt({
    context: {
      artifact: {
        kind: "token_decision",
        selection: { token: ",", tokenId: 11, position: 0, probability: 0.856 },
        structuredData: {
          alternatives: [
            { token: ",", probability: 0.856 },
            { token: " and", probability: 0.062 }
          ]
        }
      },
      textContext: { prompt: "Once upon a time", generatedPrefix: "," },
      model: { name: "GPT_2", task: "text_to_text", framework: "PyTorch" }
    },
    question: "Why was this token selected here?",
    expertiseLevel: "beginner",
    attachmentMetadata: []
  });

  assert.match(prompt, /Do not claim the token was the argmax/);
  assert.match(prompt, /Do not claim attention weights, hidden states, embeddings, or advance planning/);
  assert.match(prompt, /probability measures continuation likelihood, not factual correctness/);
  assert.match(prompt, /token probability does not establish factual correctness/);
  assert.match(prompt, /GPT-2 and BLOOM generate a continuation/);
});

test("grounds BLOOM token decisions with the same model-neutral guidance", () => {
  const prompt = buildExplanationPrompt({
    context: {
      artifact: {
        kind: "token_decision",
        selection: { token: " world", tokenId: 123, position: 0, probability: 0.42 }
      },
      model: { name: "bloom_560m", task: "text_to_text", framework: "PyTorch" }
    },
    question: "Why was this token selected here?",
    expertiseLevel: "beginner",
    attachmentMetadata: []
  });

  assert.match(prompt, /GPT-2 and BLOOM generate a continuation/);
  assert.match(prompt, /the text-generation model predicts plausible continuation text/);
});

test("grounds spectrogram explanations as signal views rather than diarization attribution", () => {
  const prompt = buildExplanationPrompt({
    context: {
      artifact: {
        kind: "spectrogram_segment",
        selection: {
          speaker: "SPEAKER_00",
          startTime: 4.88,
          endTime: 9.9,
          confidence: 1
        },
        structuredData: { numBands: 80, numFrames: 250 }
      },
      model: { name: "pyannote_diarization", task: "audio_diarization", framework: "PyTorch" }
    },
    question: "What am I looking at?",
    expertiseLevel: "beginner",
    attachmentMetadata: [{
      role: "spectrogram",
      mimeType: "image/png",
      description: "Rendered spectrogram for SPEAKER_00"
    }]
  });

  assert.match(prompt, /not automatically an attribution map/);
  assert.match(prompt, /Do not infer a speaker's real-world identity, gender, age, ethnicity/);
  assert.match(prompt, /supplied confidence value/);
  assert.match(prompt, /anonymous speaker label is not a person's real identity/);
  assert.match(prompt, /role=spectrogram/);
});

test("gives beginners plain-language and concise limitation requirements", () => {
  const prompt = promptFor("beginner");

  assert.match(prompt, /What am I looking at, and what does it mean/);
  assert.match(prompt, /Avoid logits, activations, gradients, spatial resolution, attribution/);
  assert.match(prompt, /only the one or two most important limitations/);
  assert.match(prompt, /Do not expose supplied implementation details/);
});

test("gives intermediate users accessible methodological caveats", () => {
  const prompt = promptFor("intermediate");

  assert.match(prompt, /familiar with basic machine learning/);
  assert.match(prompt, /coarse localization/);
  assert.match(prompt, /correlation versus causation/);
});

test("allows expert detail only when supported by supplied context", () => {
  const prompt = promptFor("expert");

  assert.match(prompt, /full technical explanation/);
  assert.match(prompt, /target-layer details, logits, class margins/);
  assert.match(prompt, /only when it is explicitly present in the request context/);
});
