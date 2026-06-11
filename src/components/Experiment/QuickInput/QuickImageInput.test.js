import React from "react";
import expect from "expect";
import { mount } from "enzyme";
import SampleInputsTab from "./Tabs/SampleInput/SampleInputsTab";
import { SampleInputs } from "./Tabs/SampleInput/SampleInputsTab.test";
import UploadInputsTab from "./Tabs/UploadInput/UploadInputsTab";
import URLInputsTab from "./Tabs/URLInput/URLInputsTab";
import { image_classification } from "../../../helpers/TaskIDs";
import Task from "../../../helpers/Task";
import QuickImageInput from "./QuickImageInput";

describe("Quick Image Input", () => {
  const LOAD_SRC = SampleInputs[0];
  beforeAll(() => {
    Object.defineProperty(global.Image.prototype, "src", {
      // Define the property setter
      set(src) {
        if (src === LOAD_SRC) {
          setTimeout(() => this.onload());
        } else {
          setTimeout(() => this.onerror(new Error("mocked error")));
        }
      },
    });
  });

  describe("Renders", () => {
    let wrapper;
    let runModelClicked;
    const sampleModel = { output: { type: image_classification } };

    beforeEach(() => {
      runModelClicked = jest.fn();
      wrapper = mount(
        <QuickImageInput
          onRunModelClicked={runModelClicked}
          sampleInputs={SampleInputs}
          model={sampleModel}
        />
      );
    });

    it("the correct container class", () => {
      expect(wrapper.find(".quick-image-input").hostNodes().length).toBe(1);
    });

    it("the correct title", () => {
      const title = wrapper
        .find(".quick-image-input")
        .find(".quick-image-input__title");

      expect(title.length).toBe(1);
      expect(title.text()).toBe("Try this model");
    });

    it("the correct subtitle", () => {
      const subtitle = wrapper
        .find(".quick-image-input")
        .find(".quick-image-input__subtitle");

      expect(subtitle.length).toBe(1);
      expect(subtitle.text()).toBe(Task.image_classification.inputText);
    });

    describe("with tabs", () => {
      it("in a tab container", () => {
        const container = wrapper
          .find(".quick-image-input")
          .find(".quick-image-input__tabs");

        expect(container.length).toBe(1);
      });

      it("that have titles", () => {
        const titleContainer = wrapper
          .find(".quick-image-input")
          .find(".quick-image-input__tabs")
          .find(".quick-image-input__tab-titles");
        const titles = titleContainer.find(
          "button.quick-image-input__tab-title"
        );
        const tabs = wrapper
          .find(".quick-image-input")
          .find(".quick-image-input__tabs")
          .find(".quick-image-input__tab");

        expect(titles.length).toBe(3);
        expect(titles.at(0).text()).toBe("Sample inputs");
        expect(titles.at(1).text()).toBe("Upload");
        expect(titles.at(2).text()).toBe("URL");
        expect(tabs.length).toBe(3);
      });

      it("that contain the correct components", () => {
        const tabs = wrapper.find(".quick-image-input__tab");

        expect(
          tabs
            .at(0)
            .containsMatchingElement(
              <SampleInputsTab sampleInputs={SampleInputs} />
            )
        ).toBeTruthy();
        expect(
          tabs.at(1).containsMatchingElement(<UploadInputsTab />)
        ).toBeTruthy();
        expect(
          tabs.at(2).containsMatchingElement(<URLInputsTab />)
        ).toBeTruthy();
      });

      it("that have accessibility features", () => {
        const titleContainer = wrapper
          .find(".quick-image-input")
          .find(".quick-image-input__tabs")
          .find(".quick-image-input__tab-titles");
        const titles = titleContainer.find(
          "button.quick-image-input__tab-title"
        );
        const tabs = wrapper.find(".quick-image-input__tab");

        expect(titleContainer.prop("role")).toBe("tablist");
        expectTitleAccessibilityWithId(titles.at(0), "sample-input");
        expectTitleAccessibilityWithId(titles.at(1), "upload-input");
        expectTitleAccessibilityWithId(titles.at(2), "url-input");

        expectTabAccessibilityWithId(tabs.at(0), "sample-input");
        expectTabAccessibilityWithId(tabs.at(1), "upload-input");
        expectTabAccessibilityWithId(tabs.at(2), "url-input");

        function expectTitleAccessibilityWithId(title, id) {
          expect(title.prop("role")).toBe("tab");
          expect(title.prop("aria-controls")).toBe(`${id}-panel`);
          expect(title.prop("id")).toBe(`${id}`);
        }

        function expectTabAccessibilityWithId(tab, id) {
          expect(tab.prop("role")).toBe("tabpanel");
          expect(tab.prop("aria-labelledby")).toBe(`${id}`);
          expect(tab.prop("id")).toBe(`${id}-panel`);
        }
      });

      it("where the first tab is selected by default", () => {
        const titles = wrapper.find(".quick-image-input__tab-title");
        const tabs = wrapper.find(".quick-image-input__tab");
        const selectedTitle = wrapper.find(
          ".quick-image-input__tab-title--selected"
        );
        const selectedTab = wrapper.find(".quick-image-input__tab--selected");

        expect(titles.at(0).prop("aria-selected")).toBe("true");
        expect(titles.at(0).prop("id")).toBe(selectedTitle.prop("id"));
        expect(titles.at(1).prop("aria-selected")).toBe("false");
        expect(titles.at(2).prop("aria-selected")).toBe("false");
        expect(tabs.at(0).prop("id")).toBe(selectedTab.prop("id"));
      });

      it("where clicking a tab title selects that tab", () => {
        wrapper.find(".quick-image-input__tab-title").at(1).simulate("click");
        const titles = wrapper.find(".quick-image-input__tab-title");
        const tabs = wrapper.find(".quick-image-input__tab");
        const selectedTitle = wrapper.find(
          ".quick-image-input__tab-title--selected"
        );
        const selectedTab = wrapper.find(".quick-image-input__tab--selected");

        expect(titles.at(0).prop("aria-selected")).toBe("false");
        expect(titles.at(1).prop("aria-selected")).toBe("true");
        expect(titles.at(1).prop("id")).toBe(selectedTitle.prop("id"));
        expect(tabs.at(1).prop("id")).toBe(selectedTab.prop("id"));
      });
    });

    describe("a run button", () => {
      it("with the correct label", () => {
        const button = wrapper
          .find(".quick-image-input")
          .find("button.quick-image-input__run-model");

        expect(button.length).toBe(1);
        expect(button.text()).toBe("Run model and see results");
      });

      it("that is disabled by default", () => {
        const button = wrapper.find(".quick-image-input__run-model");

        expect(button.prop("disabled")).toBeTruthy();
      });

      it("that becomes enabled when an input is selected", () => {
        wrapper.find("img").first().simulate("click");
        wrapper.update();
        const button = wrapper.find(".quick-image-input__run-model");

        expect(button.prop("disabled")).toBeFalsy();
      });

      it("where clicking calls the provided onRunModelClicked method with the selected input", () => {
        wrapper.find("img").first().simulate("click");
        wrapper.update();
        wrapper.find(".quick-image-input__run-model").simulate("click");

        expect(runModelClicked.mock.calls.length).toBe(1);
        expect(runModelClicked.mock.calls[0][0][0]).toBe(
          "https://example.com/sample1.jpg"
        );
      });
    });

    describe("explanation option", () => {
      it("is hidden for unsupported models", () => {
        expect(wrapper.find(".quick-image-input__explanation-option").length).toBe(0);
      });

      it("sends an opt-in request for supported models", () => {
        const supportedRun = jest.fn();
        const supported = mount(
          <QuickImageInput
            onRunModelClicked={supportedRun}
            sampleInputs={SampleInputs}
            model={{
              name: "TorchVision.ResNet.18",
              framework: { name: "PyTorch" },
              output: { type: image_classification }
            }}
          />
        );
        supported.find("img").first().simulate("click");
        supported.find("input[type='checkbox']").simulate("change", {
          target: { checked: true }
        });
        supported.find(".quick-image-input__run-model").simulate("click");

        expect(supportedRun.mock.calls[0][2]).toEqual({
          explanation: {
            enabled: true,
            method: "grad_cam",
            topK: 2
          }
        });
      });
    });

    describe("a Sample Inputs Tab", () => {
      it("that calls back to selectInput()", () => {
        wrapper.find("img").first().simulate("click");
        wrapper.update();

        expect(
          wrapper.find(".quick-image-input__run-model").prop("disabled")
        ).toBeFalsy();
      });
    });

    describe("a URL Inputs Tab", () => {
      it("that calls back to selectInput()", async () => {
        wrapper
          .find(".url-inputs__url")
          .simulate("change", { target: { value: SampleInputs[0].src } });

        await new Promise((resolve) => setTimeout(resolve, 10));

        wrapper.update();

        expect(
          wrapper.find(".quick-image-input__run-model").prop("disabled")
        ).toBeFalsy();
      });
    });
  });
});
