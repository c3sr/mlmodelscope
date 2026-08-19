import React from "react";
import { mount } from "enzyme";
import ExplanationPanel from "./ExplanationPanel";

const explanation = {
  status: "complete",
  method: "grad_cam",
  targetLayer: "layer4.-1",
  inputView: {
    width: 224,
    height: 224,
    description: "Exact model input crop."
  },
  pipeline: {
    preprocess: {
      operations: ["Resize", "Center crop", "Normalize"],
      modelInput: { mimeType: "image/png", data: "input" },
      tensor: { shape: [1, 3, 224, 224], dataType: "float32" }
    },
    inference: {
      model: "torchvision_resnet_18",
      targetLayer: "layer4.-1",
      rawOutput: {
        shape: [1, 1000],
        classes: [
          { rank: 1, index: 1, label: "winner", logit: 4, probability: 0.7 },
          { rank: 2, index: 2, label: "runner-up", logit: 3, probability: 0.2 }
        ]
      }
    },
    postprocess: {
      operation: "softmax",
      classes: [
        { rank: 1, index: 1, label: "winner", logit: 4, probability: 0.7 },
        { rank: 2, index: 2, label: "runner-up", logit: 3, probability: 0.2 }
      ]
    },
    finalOutput: {
      rank: 1,
      index: 1,
      label: "winner",
      logit: 4,
      probability: 0.7
    }
  },
  classes: [
    {
      rank: 1,
      index: 1,
      label: "winner",
      logit: 4,
      probability: 0.7,
      overlay: { mimeType: "image/png", data: "abc" },
      heatmap: { mimeType: "image/png", data: "heat-a" },
      focusMask: { mimeType: "image/png", data: "focus-a" }
    },
    {
      rank: 2,
      index: 2,
      label: "runner-up",
      logit: 3,
      probability: 0.2,
      overlay: { mimeType: "image/png", data: "def" },
      heatmap: { mimeType: "image/png", data: "heat-b" },
      focusMask: { mimeType: "image/png", data: "focus-b" }
    }
  ],
  comparison: { logitMargin: 1, probabilityMargin: 0.5 },
  limitations: ["A limitation."]
};

describe("ExplanationPanel", () => {
  it("switches the displayed class overlay", () => {
    const wrapper = mount(<ExplanationPanel explanation={explanation} />);
    expect(wrapper.find("figure").at(1).hasClass(
      "model-explanation__overlay-card--selected"
    )).toBe(true);
    wrapper.find(".model-explanation__overlay-card button").at(1).simulate("click");
    expect(wrapper.find("figure").at(2).hasClass(
      "model-explanation__overlay-card--selected"
    )).toBe(true);
  });

  it("renders accessible explanatory sections", () => {
    const wrapper = mount(<ExplanationPanel explanation={explanation} />);
    expect(wrapper.find("details").length).toBe(0);
    expect(wrapper.text()).toContain("not proof of recognition");
    expect(wrapper.text()).toContain("Prepare pixels");
    expect(wrapper.text()).toContain("Compute raw scores");
    expect(wrapper.text()).toContain("Convert and rank");
    expect(wrapper.text()).toContain("Preprocessing operations");
    expect(wrapper.text()).toContain("How to read the maps");
    expect(wrapper.text()).toContain("How Grad-CAM works");
    expect(wrapper.text()).toContain("Limitations");
    expect(wrapper.text()).toContain("full-color areas inside the cyan boundary");
    expect(wrapper.find("[aria-label='Evidence intensity legend']").length).toBe(0);
    expect(wrapper.find("img").at(0).prop("alt")).toContain("Exact center-cropped");
  });

  it("defaults to focus areas and can switch to the intensity map", () => {
    const wrapper = mount(<ExplanationPanel explanation={explanation} />);
    const evidenceImages = () => wrapper.find(".model-explanation__evidence-image img");

    expect(evidenceImages().at(0).prop("src")).toContain("focus-a");
    wrapper.find("[aria-label='Evidence visualization'] button").at(1).simulate("click");
    expect(evidenceImages().at(0).prop("src")).toContain("heat-a");
    expect(wrapper.find("[aria-label='Evidence intensity legend']").length).toBe(1);
  });

  it("explains the class and visualization associated with each evidence card", () => {
    const onExplainEvidence = jest.fn();
    const wrapper = mount(
      <ExplanationPanel explanation={explanation} onExplainEvidence={onExplainEvidence} />
    );

    wrapper.find(".model-explanation__overlay-card figcaption button").at(1).simulate("click");
    expect(onExplainEvidence).toHaveBeenLastCalledWith({
      classResult: explanation.classes[1],
      evidenceView: "focus"
    });

    wrapper.find("[aria-label='Evidence visualization'] button").at(1).simulate("click");
    wrapper.find(".model-explanation__overlay-card figcaption button").at(0).simulate("click");
    expect(onExplainEvidence).toHaveBeenLastCalledWith({
      classResult: explanation.classes[0],
      evidenceView: "intensity"
    });
  });

  it("shows fallback preprocessing operations when metadata is absent", () => {
    const withoutOperations = {
      ...explanation,
      pipeline: {
        ...explanation.pipeline,
        preprocess: {
          ...explanation.pipeline.preprocess,
          operations: []
        }
      }
    };
    const wrapper = mount(<ExplanationPanel explanation={withoutOperations} />);

    expect(wrapper.text()).toContain("Convert the uploaded image to RGB");
    expect(wrapper.text()).toContain("Normalize each RGB channel");
  });

  it("keeps a failed explanation concise", () => {
    const wrapper = mount(
      <ExplanationPanel explanation={{ status: "failed" }} />
    );
    expect(wrapper.text()).toContain("prediction completed");
  });
});
