const expertiseLevels = new Set(["beginner", "intermediate", "expert"]);
const imageRoles = new Set([
  "original_input",
  "focus_mask",
  "gradcam_overlay",
  "heatmap",
  "segmentation_overlay",
  "spectrogram",
  "visualization"
]);
const imageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function validateExplanationRequest({ context, question, expertiseLevel, attachmentMetadata = [] }) {
  if (!context || typeof context !== "object" || Array.isArray(context))
    throw badRequest("context must be a JSON object");

  if (!context.artifact || typeof context.artifact !== "object")
    throw badRequest("context.artifact is required");

  if (typeof context.artifact.kind !== "string" || context.artifact.kind.trim() === "")
    throw badRequest("context.artifact.kind is required");

  if (typeof question !== "string" || question.trim() === "")
    throw badRequest("question is required");

  if (!expertiseLevels.has(expertiseLevel))
    throw badRequest("expertiseLevel must be beginner, intermediate, or expert");

  if (!Array.isArray(attachmentMetadata))
    throw badRequest("attachmentMetadata must be an array");

  attachmentMetadata.forEach((metadata, index) => {
    if (!metadata || typeof metadata !== "object")
      throw badRequest(`attachmentMetadata[${index}] must be an object`);
    if (!imageRoles.has(metadata.role))
      throw badRequest(`attachmentMetadata[${index}].role is invalid`);
    if (typeof metadata.mimeType !== "string" || !imageMimeTypes.has(metadata.mimeType))
      throw badRequest(`attachmentMetadata[${index}].mimeType must be a supported image type`);
    if (metadata.description !== undefined && typeof metadata.description !== "string")
      throw badRequest(`attachmentMetadata[${index}].description must be a string`);
  });

  return {
    context,
    question: question.trim(),
    expertiseLevel,
    attachmentMetadata
  };
}

export function validateAttachment(file) {
  if (!file || !imageMimeTypes.has(file.mimetype))
    throw badRequest("Only JPEG, PNG, WebP, and GIF image attachments are supported");
}

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}
