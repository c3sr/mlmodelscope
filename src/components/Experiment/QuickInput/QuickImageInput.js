import React, { useState } from "react";
import "./QuickImageInput.scss";
import Task from "../../../helpers/Task";
import useQuickInputControl from "./useQuickInputControl";
import useBEMNaming from "../../../common/useBEMNaming";
import { QuickInputTabContent } from "./QuickInputTabContent";
import { QuickInputTabTitle } from "./QuickInputTabTitle";
import { QuickInputType } from "./quickInputType";
import {
  gradCAMRequest,
  isGradCAMSupportedModel
} from "../../../helpers/explanation";

export default function QuickImageInput(props) {
  const [explanationEnabled, setExplanationEnabled] = useState(false);
  const {
    tabIsSelected,
    selectedInputs,
    addInput,
    getTabs,
    removeInput,
    selectTab,
    selectInput,
    runModel,
    submitButtonIsDisabled
  } = useQuickInputControl(props);
  const { getBlock, getElement } = useBEMNaming("quick-image-input");

  const task = Task.getStaticTask(props.model.output.type);
  const tabs = getTabs(QuickInputType.Image);
  const supportsExplanation = isGradCAMSupportedModel(props.model);
  return (
    <div className={getBlock()}>
      {!props.hideHeader && (
        <>
          <h2 className={getElement("title")}>Try this model</h2>
          <div className={getElement("subtitle")}>{task.inputText}</div>
        </>
      )}
      <div className={getElement("tabs")}>
        <div className={getElement("tab-titles")} role="tablist">
          {tabs.map((tab, index) => (
            <QuickInputTabTitle
              key={index}
              tab={tab}
              index={index}
              tabIsSelected={tabIsSelected}
              selectTab={selectTab}
              getElement={getElement}
            />
          ))}
        </div>
        {tabs.map((tab, index) => (
          <QuickInputTabContent
            key={index}
            tab={tab}
            index={index}
            getElement={getElement}
            {...props}
            removeInput={removeInput}
            addInput={addInput}
            selectInput={selectInput}
            tabIsSelected={tabIsSelected}
            selectedInputs={selectedInputs}
          />
        ))}
      </div>
      {supportsExplanation && (
        <label className={getElement("explanation-option")}>
          <input
            type="checkbox"
            checked={explanationEnabled}
            onChange={(event) => setExplanationEnabled(event.target.checked)}
          />
          <span>
            <strong>Explain this prediction</strong>
            <small>Generate Grad-CAM evidence for the two highest-ranked classes.</small>
          </span>
        </label>
      )}
      <button
        className={getElement("run-model")}
        disabled={submitButtonIsDisabled()}
        onClick={() =>
          runModel({
            explanation: gradCAMRequest(explanationEnabled)
          })
        }
      >
        Run model and see results
      </button>
    </div>
  );
}
