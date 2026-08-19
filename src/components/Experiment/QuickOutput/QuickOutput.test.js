import React from "react";
import expect from "expect";
import { mount, shallow } from "enzyme";
import QuickOutput, { makeTokenDecisionArtifacts } from "./QuickOutput";
import InputPreview from "./InputPreview";
import ClassificationOutput from "./Outputs/Classification/ClassificationOutput";
import ExplanationPanel from "./Outputs/Classification/ExplanationPanel";
import { TestImageClassificationResult } from "./Outputs/Classification/Features";
import { TestObjectDetectionResult } from "./Outputs/ObjectDetection/testData/TestFeatures";
import { render } from "@testing-library/react";

const TestInput = "http://example.com/image1.jpeg";

describe("GPT_2 token decision artifacts", () => {
  it("bounds prompt, prefix, and alternatives without including future tokens", () => {
    const alternatives = Array.from({ length: 6 }, (_, index) => ({
      id: index,
      token: ` alternative-${index}`,
      probability: 0.5 - index * 0.05
    }));
    const trial = {
      inputs: [{ src: "p".repeat(2200), inputType: "TEXT" }],
      model: {
        name: "GPT_2",
        output: { type: "text_to_text" },
        framework: { name: "PyTorch", version: "1.5.0" }
      }
    };
    const explanation = {
      status: "complete",
      pipeline: {
        preprocess: {
          tokenizer: "GPT2Tokenizer",
          tokens: [{ id: 1, token: "prompt" }],
          tensor: { vocabularySize: 50257 }
        }
      },
      tokens: [
        { position: 0, id: 11, token: ",", probability: 0.856, rank: 1, alternatives },
        { position: 1, id: 12, token: " future", probability: 0.5, rank: 2, alternatives: [] }
      ]
    };

    const [artifact] = makeTokenDecisionArtifacts(trial, explanation);

    expect(artifact.kind).toBe("token_decision");
    expect(artifact.selection).toEqual({
      token: ",",
      tokenId: 11,
      position: 0,
      probability: 0.856,
      rank: 1
    });
    expect(artifact.structuredData.alternatives).toHaveLength(5);
    expect(artifact.structuredData.tokenizer).toEqual({
      name: "GPT2Tokenizer",
      promptTokenCount: 1,
      vocabularySize: 50257
    });
    expect(artifact.textContext.prompt).toHaveLength(2000);
    expect(artifact.textContext.generatedPrefix).toBe(",");
    expect(artifact.textContext.generatedPrefix).not.toContain("future");
  });
});

describe("Experiment Quick Output component", () => {
  describe("with output", () => {
    it("image classification", () => {
      let wrapper = mount(
        <QuickOutput
          input={TestInput}
          trialOutput={TestImageClassificationResult}
          model={TestImageClassificationResult.model}
          features={TestImageClassificationResult.results.responses[0].features}
        />
      );
      const prediction_text = wrapper
        .find(".top-prediction__prediction")
        .text();

      expect(prediction_text.includes("bee eater")).toBe(true);
    });

    it("places model explanation below the input and output row", () => {
      const explainedTrial = {
        ...TestImageClassificationResult,
        results: {
          ...TestImageClassificationResult.results,
          explanation: {
            status: "complete",
            classes: [
              { rank: 1, index: 1, label: "winner", probability: 0.7, logit: 4 },
              { rank: 2, index: 2, label: "runner-up", probability: 0.2, logit: 3 }
            ]
          }
        }
      };
      const wrapper = shallow(
        <QuickOutput
          input={TestInput}
          trialOutput={explainedTrial}
          features={explainedTrial.results.responses[0].features}
        />
      );

      expect(wrapper.find(".quick-output__content").find(ExplanationPanel).length).toBe(0);
      expect(wrapper.find(".quick-output__explanation").find(ExplanationPanel).length).toBe(1);
    });
    it("object detection", () => {
      let wrapper = mount(
        <QuickOutput
          input={TestInput}
          trialOutput={TestObjectDetectionResult}
          model={TestObjectDetectionResult.model}
        />
      );

      const carText = wrapper
        .find(".object-detection-table__row-input-label")
        .first()
        .text()
        .toLowerCase();

      expect(carText.includes("car")).toBe(true);
    });
  });
  describe("Renders", () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(
        <QuickOutput
          input={TestInput}
          trialOutput={TestImageClassificationResult}
          model={TestImageClassificationResult.model}
        />
      );
    });

    it("a container div", () => {
      expect(wrapper.at(0).type()).toBe("div");
      expect(wrapper.at(0).prop("className")).toBe("quick-output");
    });

    describe("with a header", () => {
      let header;

      beforeEach(() => {
        header = wrapper.at(0).childAt(0);
      });

      it("wrapped in a div", () => {
        expect(header.type()).toBe("div");
        expect(header.prop("className")).toBe("quick-output__header");
      });

      it("with the correct title", () => {
        const header = wrapper.find(".quick-output__header");
        expect(header.childAt(0).type()).toBe("h2");
        expect(header.childAt(0).prop("className")).toBe("quick-output__title");
        expect(header.childAt(0).text()).toBe("Try This Model");
      });

      // share button is hidden for now
      // it('and a share button', () => {
      //   const header = wrapper.find('.quick-output__header');
      //   expect(header.childAt(1).type()).toBe('button');
      //   expect(header.childAt(1).prop('className')).toBe('quick-output__share-button');
      // });
    });

    describe("with content", () => {
      let content;

      beforeEach(() => {
        content = wrapper.at(0).childAt(1);
      });

      it("wrapped in a div", () => {
        expect(content.type()).toBe("div");
        expect(content.prop("className")).toBe("quick-output__content");
      });

      it("that contains an input image preview", () => {
        const preview = content.childAt(0);

        expect(preview.type()).toBe(InputPreview);
        expect(preview.prop("input")).toBe(TestInput);
      });

      it("that contains a classification output", () => {
        const output = content.childAt(1);

        expect(output.type()).toBe(ClassificationOutput);
      });
    });

    describe("with a footer", () => {
      let footer;

      beforeEach(() => {
        footer = wrapper.at(0).childAt(2);
      });

      it("wrapped in a div", () => {
        expect(footer.type()).toBe("div");
        expect(footer.prop("className")).toBe("quick-output__footer");
      });

      it("with a use in experiment button", () => {
        expect(footer.childAt(0).type()).toBe("button");
        expect(footer.childAt(0).prop("className")).toBe(
          "quick-output__compare-button"
        );
        expect(footer.childAt(0).text()).toBe("Compare with other models");
      });
    });
  });

  describe("Text Input Type", () => {
    let result;

    beforeEach(() => {
      result = render(
        <QuickOutput
          input={"Translate this text"}
          features={null}
          trialOutput={{ id: "1234", input: "Translate this text" }}
          inputType={"text"}
        />
      );
    });

    it("renders the correct input component", () => {
      const { container } = result;

      const inputWrapper = container.querySelector(".input-preview__text");

      expect(inputWrapper).toBeTruthy();
    });
  });
});
