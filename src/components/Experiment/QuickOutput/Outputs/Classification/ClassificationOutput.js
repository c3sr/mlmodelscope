import React from 'react';
import TopPrediction from "./TopPrediction";
import "./ClassificationOutput.scss";
import PredictionExpander from "../../../../Common/PredictionExpander";
import NoPredictions from "../_Common/components/NoPredictions";
import Task from "../../../../../helpers/Task";
import OutputDuration from "../_Common/components/OutputDuration";
import DurationConverter from "../_Common/utils/DurationConverter";
import useBEMNaming from "../../../../../common/useBEMNaming";
import AIExplainAction from "../../InteractiveExplanation/AIExplainAction";

const defaultProps = {
    className: "classification-output",
    features: []
}

export default function ClassificationOutput(givenProps) {
    const props = {...defaultProps, ...givenProps};
    const {getBlock, getElement} = useBEMNaming(props.className);
    const task = Task.image_classification;

    const getPredictionBody = () => {
        if (props.features.length > 0)
            return <div className={getElement('predictions')}>
                <TopPrediction
                    hideRating={props.hideRating}
                    feature={props.features[0]}
                    onExplain={props.onExplainPrediction
                        ? () => props.onExplainPrediction(props.features[0], 0)
                        : undefined}
                />
                <PredictionExpander
                    predictions={props.features}
                    onExplainPrediction={props.onExplainPrediction}
                    explainablePredictionCount={props.explainablePredictionCount}
                />
            </div>

        return <NoPredictions modelId={props.modelId}/>
    }

    return (
        <div className={getBlock()}>
            <div className={getElement("title-row")}>
                <h3 className={getElement('title')}>Output</h3>
                <div className={getElement("title-actions")}>
                    {props.onAskAIAboutResult && (
                        <AIExplainAction
                            className={getElement("ask-ai")}
                            onClick={props.onAskAIAboutResult}
                            ariaLabel="Explain this classification result with AI"
                        />
                    )}
                    {!props.hideDuration &&
                        <OutputDuration duration={DurationConverter(props.trial.results.duration)}/>
                    }
                </div>
            </div>
            <div className={getElement('subtitle')}>{task.outputText}</div>
            {getPredictionBody()}
        </div>
    );
}
