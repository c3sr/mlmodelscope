# Multimodal Explanation API

A small standalone Node.js service that accepts explanation context and optional image attachments, then asks a configurable vision-language model for an explanation.

The service supports:

- Google Gemini
- OpenAI vision-language models
- Local vLLM servers and other OpenAI-compatible APIs

It has no knowledge of ML Model Scope trials, experiments, or its existing backend. Provider selection is server-side and does not change the `/v1/explain` request or response contract.

## Requirements

- Node.js 20 or newer; Node.js 22.23.2 is pinned in `.nvmrc` and the service image
- An API key for Gemini or OpenAI; local vLLM does not require one unless its server was configured to require authentication

## Setup

```sh
cd explanation-api
cp .env.example .env
npm install
npm test
npm start
```

The service listens on `http://127.0.0.1:8090` by default. Keep hosted-provider API keys server-side; do not expose them to the React application.

The frontend and this service both pin Node.js 22.23.2. From either directory, `nvm install && nvm use` selects the
shared runtime. From the repository root, `docker compose up --build` builds and runs both services consistently.

## Model provider configuration

Set `EXPLANATION_PROVIDER` to `gemini`, `openai`, `vllm`, or `openai-compatible`.

Generic variables work across providers:

- `EXPLANATION_MODEL`: provider model identifier.
- `EXPLANATION_BASE_URL`: base API URL for OpenAI-compatible providers. It may end in `/v1` or `/chat/completions`.
- `EXPLANATION_API_KEY`: hosted-provider API key. Optional for vLLM and other unauthenticated local APIs.
- `EXPLANATION_RESPONSE_FORMAT`: `json_schema` (default), `json_object`, or `none`. Use `json_object` or `none` for an older OpenAI-compatible server that does not accept JSON Schema.

Provider-specific variables are also supported, and the generic variable takes precedence:

| Provider | Model | Base URL | API key |
| --- | --- | --- | --- |
| Gemini | `GEMINI_MODEL` | n/a | `GEMINI_API_KEY` |
| OpenAI | `OPENAI_MODEL` | `OPENAI_BASE_URL` | `OPENAI_API_KEY` |
| vLLM | `VLLM_MODEL` | `VLLM_BASE_URL` | `VLLM_API_KEY` (optional) |

If `EXPLANATION_PROVIDER` is omitted, the service retains its previous Gemini behavior. `GEMINI_MODEL` defaults to `gemini-3.6-flash`; the OpenAI model defaults to `gpt-4.1-mini`. A vLLM model name must be supplied because it depends on the model served locally.

### Gemini

```dotenv
EXPLANATION_PROVIDER=gemini
EXPLANATION_MODEL=gemini-3.6-flash
EXPLANATION_API_KEY=your-key
```

The older `GEMINI_MODEL` and `GEMINI_API_KEY` names continue to work.

### OpenAI

```dotenv
EXPLANATION_PROVIDER=openai
EXPLANATION_MODEL=gpt-4.1-mini
OPENAI_API_KEY=your-key
```

### Local vLLM

Start a vision-language model with vLLM's OpenAI-compatible server, then configure this service with the served model name. No key is needed by default.

```dotenv
EXPLANATION_PROVIDER=vllm
EXPLANATION_MODEL=Qwen/Qwen2.5-VL-7B-Instruct
EXPLANATION_BASE_URL=http://127.0.0.1:8000/v1
```

The chosen local model must support image inputs when requests contain attachments. Text-only explanation requests can use a text-only model.

### Other OpenAI-compatible platforms

```dotenv
EXPLANATION_PROVIDER=openai-compatible
EXPLANATION_MODEL=provider-model-name
EXPLANATION_BASE_URL=https://provider.example/v1
EXPLANATION_API_KEY=your-key
```

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
- `attachmentMetadata`: JSON array with one item per file. Supported roles are `original_input`, `focus_mask`, `gradcam_overlay`, `heatmap`, `segmentation_overlay`, `spectrogram`, and `visualization`.

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

## Explanation behavior

The same provider-neutral prompt identifies the artifact, image roles, question, expertise level, model-result values, and existing XAI values. It instructs every model to distinguish supplied evidence from general interpretation and not describe visual evidence as proof when the context does not support that claim.
