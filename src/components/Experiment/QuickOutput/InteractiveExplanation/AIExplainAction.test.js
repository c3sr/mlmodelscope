import React from "react";
import { shallow } from "enzyme";
import AIExplainAction from "./AIExplainAction";

describe("AIExplainAction", () => {
  it("owns the unified visible label and forwards its accessible label", () => {
    const onClick = jest.fn();
    const wrapper = shallow(
      <AIExplainAction
        onClick={onClick}
        ariaLabel="Explain this classification result with AI"
      />
    );

    expect(wrapper.text()).toBe("✨ Explain");
    expect(wrapper.prop("aria-label")).toBe("Explain this classification result with AI");
    wrapper.simulate("click");
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
