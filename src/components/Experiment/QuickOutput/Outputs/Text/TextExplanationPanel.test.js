import React from "react";
import { mount } from "enzyme";
import AIExplainAction from "../../InteractiveExplanation/AIExplainAction";
import TextExplanationPanel from "./TextExplanationPanel";

const tokens = [
  {
    position: 0,
    id: 11,
    token: ",",
    probability: 0.856,
    rank: 1,
    alternatives: [
      { id: 11, token: ",", probability: 0.856 },
      { id: 290, token: " and", probability: 0.062 }
    ]
  }
];

const explanation = {
  status: "complete",
  tokens,
  pipeline: {
    preprocess: { tokens: [], operations: [] },
    inference: {},
    postprocess: { operations: [], generatedText: "," }
  },
  summary: {},
  limitations: []
};

describe("TextExplanationPanel", () => {
  it("uses one contextual explain action for each generated-token row", () => {
    const onExplainToken = jest.fn();
    const wrapper = mount(
      <TextExplanationPanel explanation={explanation} onExplainToken={onExplainToken} />
    );

    expect(wrapper.find(AIExplainAction).length).toBe(1);
    expect(wrapper.find(AIExplainAction).prop("ariaLabel")).toContain("generation step 1");
    wrapper.find(AIExplainAction).prop("onClick")();
    expect(onExplainToken).toHaveBeenCalledWith(tokens[0]);
    expect(wrapper.text()).toContain("Show top alternatives");
  });
});
