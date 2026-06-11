import {
  gradCAMRequest,
  isGradCAMSupportedModel
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
});
