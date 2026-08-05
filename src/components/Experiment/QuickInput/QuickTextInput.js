import React, { useState } from "react";
import useBEMNaming from "../../../common/useBEMNaming";
import Task from "../../../helpers/Task";
import "./QuickTextInput.scss";
import {QuickInputTabTitle} from "./QuickInputTabTitle";
import {QuickInputTabContent} from "./QuickInputTabContent";
import useQuickInputControl from "./useQuickInputControl";
import {QuickInputType} from "./quickInputType";
import {
    isTokenProbabilitySupportedModel,
    tokenProbabilityRequest
} from "../../../helpers/explanation";

export default function QuickTextInput(props) {
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
        hideUpload,
        submitButtonIsDisabled
    } = useQuickInputControl(props);
    const {getBlock, getElement} = useBEMNaming("quick-text-input");
    const task = Task.getStaticTask(props.model.output.type);
    const tabs = getTabs(QuickInputType.Text);
    const supportsExplanation = isTokenProbabilitySupportedModel(props.model);

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
                        <strong>Explain this generation</strong>
                        <small>Show tokenization, next-token probabilities, and top alternatives.</small>
                    </span>
                </label>
            )}

            <button
                disabled={submitButtonIsDisabled()}
                onClick={() =>
                    runModel({
                        explanation: tokenProbabilityRequest(explanationEnabled)
                    })
                }
                className={getElement("submit-button")}
            >
                Run model and see results
            </button>
        </div>
    );
}
