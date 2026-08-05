const supportedResNetModels = new Set([
  "torchvision_resnet_18",
  "torchvision_resnet_34",
  "torchvision_resnet_50",
  "torchvision_resnet_101",
  "torchvision_resnet_152"
]);

export const isGradCAMSupportedModel = (model) => {
  if (model?.output?.type !== "image_classification")
    return false;

  const framework = model?.framework?.name?.toLowerCase();
  const normalizedName = model?.name
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  return framework === "pytorch" && supportedResNetModels.has(normalizedName);
};

export const gradCAMRequest = (enabled) => ({
  enabled,
  method: "grad_cam",
  topK: 2
});

export const isTokenProbabilitySupportedModel = (model) => {
  if (model?.output?.type !== "text_to_text")
    return false;

  const framework = model?.framework?.name?.toLowerCase();
  const normalizedName = model?.name
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  return framework === "pytorch" && normalizedName === "gpt_2";
};

export const tokenProbabilityRequest = (enabled) => ({
  enabled,
  method: "token_probability",
  topK: 5
});
