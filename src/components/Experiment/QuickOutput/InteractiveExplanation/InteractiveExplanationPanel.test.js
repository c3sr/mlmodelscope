import React from "react";
import { act } from "react-dom/test-utils";
import { mount } from "enzyme";
import InteractiveExplanationPanel from "./InteractiveExplanationPanel";
import {
  InteractiveExplanationProvider,
  useInteractiveExplanation
} from "./InteractiveExplanationContext";

const artifacts = [
  {
    id: "classification-1",
    label: "goldfinch",
    kind: "classification",
    selection: { classIndex: 1, label: "goldfinch" },
    structuredData: {
      predictions: [{ index: 1, label: "goldfinch", probability: 0.8 }]
    },
    model: {
      name: "Example Model",
      task: "image_classification",
      framework: "PyTorch",
      frameworkVersion: "2.0"
    }
  }
];

function OpenExplanationButton({
  artifact = artifacts[0],
  question = "Why was this class ranked highest?"
}) {
  const { selectArtifact } = useInteractiveExplanation();
  return (
    <button
      type="button"
      onClick={() => selectArtifact(artifact, question)}
    >
      Open explanation
    </button>
  );
}

describe("InteractiveExplanationPanel", () => {
  beforeEach(() => {
    fetchMock.resetHistory();
    process.env.REACT_APP_EXPLANATION_API_URL = "http://explanation-api.test";
    fetchMock.post("http://explanation-api.test/v1/explain", {
      answer: "The selected class had the highest probability.",
      limitations: []
    });
  });

  it("sends only the selected artifact and user preferences", async () => {
    const wrapper = mount(
      <InteractiveExplanationProvider artifacts={artifacts}>
        <OpenExplanationButton />
        <InteractiveExplanationPanel />
      </InteractiveExplanationProvider>
    );

    wrapper.find("button").filterWhere((button) => button.text() === "Open explanation").simulate("click");
    wrapper.update();

    await act(async () => {
      wrapper.find("form").simulate("submit");
    });
    wrapper.update();

    expect(JSON.parse(fetchMock.lastOptions().body)).toEqual({
      context: {
        artifact: {
          kind: "classification",
          selection: { classIndex: 1, label: "goldfinch" },
          structuredData: {
            predictions: [{ index: 1, label: "goldfinch", probability: 0.8 }]
          }
        },
        model: {
          name: "Example Model",
          task: "image_classification",
          framework: "PyTorch",
          frameworkVersion: "2.0"
        }
      },
      question: "Why was this class ranked highest?",
      expertiseLevel: "beginner"
    });
    expect(wrapper.text()).toContain("The selected class had the highest probability.");
  });

  it("stays closed until a contextual action selects an artifact", () => {
    const wrapper = mount(
      <InteractiveExplanationProvider artifacts={artifacts}>
        <OpenExplanationButton />
        <InteractiveExplanationPanel />
      </InteractiveExplanationProvider>
    );

    expect(wrapper.find(".interactive-explanation").length).toBe(0);
    wrapper.find("button").filterWhere((button) => button.text() === "Open explanation").simulate("click");
    wrapper.update();

    expect(wrapper.find(".interactive-explanation").length).toBe(1);
    expect(wrapper.text()).toContain("goldfinch");
    expect(wrapper.find("select").first().prop("value")).toBe("beginner");
    expect(wrapper.find("textarea").prop("value")).toBe("Why was this class ranked highest?");
    expect(wrapper.text()).not.toContain("Artifact");
  });

  it("presents limitations using the selected expertise level", async () => {
    fetchMock.post("http://explanation-api.test/v1/explain", {
      answer: "The highlighted area overlaps the bird.",
      limitations: ["The visualization does not prove the prediction is correct."]
    }, { overwriteRoutes: true });
    const wrapper = mount(
      <InteractiveExplanationProvider artifacts={artifacts}>
        <OpenExplanationButton />
        <InteractiveExplanationPanel />
      </InteractiveExplanationProvider>
    );

    wrapper.find("button").filterWhere((button) => button.text() === "Open explanation").simulate("click");
    await act(async () => {
      wrapper.find("form").simulate("submit");
    });
    wrapper.update();
    expect(wrapper.find(".interactive-explanation__answer h5").text()).toBe("Keep in mind");

    wrapper.find("select").simulate("change", { target: { value: "expert" } });
    wrapper.update();
    expect(wrapper.find(".interactive-explanation__answer").length).toBe(0);
    await act(async () => {
      wrapper.find("form").simulate("submit");
    });
    wrapper.update();
    expect(wrapper.find(".interactive-explanation__answer h5").text()).toBe("Technical limitations");
  });

  it("sends selected text with compact result context through the existing request", async () => {
    const textSelectionArtifact = {
      id: "text-selection-test",
      label: "Selected text",
      kind: "text_selection",
      transient: true,
      selection: {
        text: "probability margin",
        surroundingText: "The probability margin compares the leading classes.",
        section: "Class evidence"
      },
      model: artifacts[0].model,
      resultContext: artifacts[0].structuredData
    };
    const wrapper = mount(
      <InteractiveExplanationProvider artifacts={artifacts}>
        <OpenExplanationButton artifact={textSelectionArtifact} />
        <InteractiveExplanationPanel />
      </InteractiveExplanationProvider>
    );

    wrapper.find("button").filterWhere((button) => button.text() === "Open explanation").simulate("click");
    await act(async () => {
      wrapper.find("form").simulate("submit");
    });
    wrapper.update();

    const request = JSON.parse(fetchMock.lastOptions().body);
    expect(request.context.artifact.kind).toBe("text_selection");
    expect(request.context.artifact.selection.text).toBe("probability margin");
    expect(request.context.resultContext.predictions).toHaveLength(1);
    expect(wrapper.text()).toContain('Explaining: "probability margin"');
  });

  it("sends a bounded GPT_2 token decision without media", async () => {
    const tokenArtifact = {
      id: "token-decision-0-11",
      label: "Generated token decision",
      kind: "token_decision",
      selection: {
        token: ",",
        tokenId: 11,
        position: 0,
        probability: 0.856,
        rank: 1
      },
      structuredData: {
        alternatives: [
          { token: ",", tokenId: 11, probability: 0.856 },
          { token: " and", tokenId: 290, probability: 0.062 }
        ],
        tokenizer: { name: "GPT2Tokenizer", promptTokenCount: 4, vocabularySize: 50257 }
      },
      textContext: {
        prompt: "Once upon a time",
        generatedPrefix: ","
      },
      model: {
        name: "GPT_2",
        task: "text_to_text",
        framework: "PyTorch"
      }
    };
    const wrapper = mount(
      <InteractiveExplanationProvider artifacts={[tokenArtifact]}>
        <OpenExplanationButton
          artifact={tokenArtifact}
          question="Why was this token selected here?"
        />
        <InteractiveExplanationPanel />
      </InteractiveExplanationProvider>
    );

    wrapper.find("button").filterWhere((button) => button.text() === "Open explanation").simulate("click");
    await act(async () => {
      wrapper.find("form").simulate("submit");
    });
    wrapper.update();

    const request = JSON.parse(fetchMock.lastOptions().body);
    expect(request.context.artifact.kind).toBe("token_decision");
    expect(request.context.textContext).toEqual(tokenArtifact.textContext);
    expect(request.attachments).toBeUndefined();
    expect(wrapper.text()).toContain('Explaining: token "," at generation step 1');
    expect(wrapper.text()).toContain("What other tokens were plausible?");
  });
});
