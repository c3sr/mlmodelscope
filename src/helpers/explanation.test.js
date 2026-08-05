import {
  gradCAMRequest,
  isGradCAMSupportedModel,
  isTokenProbabilitySupportedModel,
  tokenProbabilityRequest
} from "./explanation";

describe("explanation helpers", () => {
  it("supports only PyTorch torchvision ResNet image classifiers", () => {
    expect(isGradCAMSupportedModel({
      name: "TorchVision.ResNet.50",
      framework: { name: "PyTorch" },
      output: { type: "image_classification" }
    })).toBe(true);
    expect(isGradCAMSupportedModel({
      name: "TorchVision.AlexNet",
      framework: { name: "PyTorch" },
      output: { type: "image_classification" }
    })).toBe(false);
  });

  it("builds the Grad-CAM request", () => {
    expect(gradCAMRequest(true)).toEqual({
      enabled: true,
      method: "grad_cam",
      topK: 2
    });
  });

  it("supports token probability explanations only for PyTorch GPT-2 text generation", () => {
    expect(isTokenProbabilitySupportedModel({
      name: "GPT_2",
      framework: { name: "PyTorch" },
      output: { type: "text_to_text" }
    })).toBe(true);
    expect(isTokenProbabilitySupportedModel({
      name: "GPT_2",
      framework: { name: "TensorFlow" },
      output: { type: "text_to_text" }
    })).toBe(false);
  });

  it("builds the token probability request", () => {
    expect(tokenProbabilityRequest(true)).toEqual({
      enabled: true,
      method: "token_probability",
      topK: 5
    });
  });
});
