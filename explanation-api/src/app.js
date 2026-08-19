import express from "express";
import multer from "multer";
import { validateAttachment, validateExplanationRequest } from "./validation.js";

const defaultMaxFileSizeBytes = 10 * 1024 * 1024;
const defaultMaxFiles = 4;

export function createApp({
  explainer,
  maxFileSizeBytes = defaultMaxFileSizeBytes,
  maxFiles = defaultMaxFiles,
  corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000"
} = {}) {
  if (!explainer || typeof explainer.explain !== "function")
    throw new Error("An explainer with an explain function is required");

  const app = express();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxFileSizeBytes,
      files: maxFiles
    }
  });

  app.disable("x-powered-by");
  app.use((request, response, next) => {
    const origin = request.headers.origin;
    if (origin === corsOrigin) {
      response.setHeader("Access-Control-Allow-Origin", origin);
      response.setHeader("Vary", "Origin");
      response.setHeader("Access-Control-Allow-Headers", "Content-Type");
      response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    }

    if (request.method === "OPTIONS")
      return response.sendStatus(origin === corsOrigin ? 204 : 403);

    next();
  });
  app.use(express.json({ limit: "256kb" }));

  app.post("/v1/explain", upload.array("attachments", maxFiles), async (request, response, next) => {
    try {
      const isMultipart = request.is("multipart/form-data");
      const context = parseJsonField(request.body.context, "context");
      const attachmentMetadata = parseJsonField(
        request.body.attachmentMetadata || "[]",
        "attachmentMetadata"
      );
      const files = request.files || [];

      if (files.length !== attachmentMetadata.length)
        throw badRequest("Each image attachment must have matching attachmentMetadata");

      files.forEach(validateAttachment);
      const validated = validateExplanationRequest({
        context,
        question: request.body.question,
        expertiseLevel: request.body.expertiseLevel,
        attachmentMetadata
      });

      const result = await explainer.explain({
        ...validated,
        attachments: files,
        isMultipart
      });

      response.json({
        answer: result.answer,
        limitations: result.limitations
      });
    } catch (error) {
      next(error);
    }
  });

  app.use((error, request, response, next) => {
    if (error instanceof multer.MulterError) {
      const message = error.code === "LIMIT_FILE_SIZE"
        ? "An image attachment exceeds the maximum size"
        : error.code === "LIMIT_FILE_COUNT"
          ? "Too many image attachments"
          : error.message;
      return response.status(400).json({ error: message });
    }

    const statusCode = error.statusCode || 502;
    response.status(statusCode).json({ error: error.message || "Unable to generate explanation" });
  });

  return app;
}

function parseJsonField(value, fieldName) {
  if (typeof value === "object" && value !== null)
    return value;
  if (typeof value !== "string" || value.trim() === "")
    throw badRequest(`${fieldName} must be valid JSON`);

  try {
    return JSON.parse(value);
  } catch (error) {
    throw badRequest(`${fieldName} must be valid JSON`);
  }
}

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}
