# Multimodal Explanation API

A small standalone Node.js service that accepts explanation context and optional image attachments, then asks a configurable Gemini Flash model for an explanation.

It has no knowledge of ML Model Scope trials, experiments, or its existing backend.

## Requirements

- Node.js 18 or newer
- A Gemini API key

## Setup

```sh
cd explanation-api
cp .env.example .env
# Set GEMINI_API_KEY in .env
npm install
npm test
npm start
```

The service listens on `http://127.0.0.1:8090` by default.

`GEMINI_MODEL` defaults to `gemini-3.6-flash` and can be changed without code changes. Keep `GEMINI_API_KEY` server-side; do not expose it to the React application.

## Endpoint

`POST /v1/explain`

The response is:

```json
{
  "answer": "...",
  "limitations": []
}
```

The required request fields are:

- `context`: JSON object containing `artifact`, and optionally structured result data, model/task metadata, and existing XAI data.
- `question`: user question.
- `expertiseLevel`: `beginner`, `intermediate`, or `expert`.

For image requests, use `multipart/form-data` with:

- `attachments`: one or more image files.
- `attachmentMetadata`: JSON array with one item per file. Supported roles are `original_input`, `gradcam_overlay`, `heatmap`, `segmentation_overlay`, `spectrogram`, and `visualization`.

Images are held in memory only for the request. JPEG, PNG, WebP, and GIF files are accepted. The defaults are four files maximum and 10 MiB per file; configure them with `MAX_IMAGE_ATTACHMENTS` and `MAX_IMAGE_BYTES`.

## Text-only example

```sh
curl -X POST http://127.0.0.1:8090/v1/explain \
  -H 'Content-Type: application/json' \
  -d '{
    "context": {
      "artifact": {
        "kind": "tokens",
        "selection": { "start": 2, "end": 4 },
        "structuredData": {
          "tokens": [
            { "token": "wonderful", "probability": 0.57, "logit": -0.56 }
          ]
        }
      },
      "model": { "name": "GPT-2", "task": "text_to_text" }
    },
    "question": "Why was this token selected?",
    "expertiseLevel": "beginner"
  }'
```

## Image example

```sh
curl -X POST http://127.0.0.1:8090/v1/explain \
  -F 'context={"artifact":{"kind":"classification","selection":{"classIndex":1}},"existingXai":{"method":"grad_cam"}}' \
  -F 'question=Why was this class ranked highest?' \
  -F 'expertiseLevel=intermediate' \
  -F 'attachmentMetadata=[{"role":"original_input","mimeType":"image/png","description":"Original model input"},{"role":"gradcam_overlay","mimeType":"image/png","description":"Grad-CAM overlay for selected class"}]' \
  -F 'attachments=@input.png;type=image/png' \
  -F 'attachments=@gradcam.png;type=image/png'
```

## Gemini behavior

The prompt identifies the artifact, image roles, question, expertise level, model-result values, and existing XAI values. It instructs Gemini to distinguish supplied evidence from general interpretation and not describe visual evidence as proof when the context does not support that claim.
