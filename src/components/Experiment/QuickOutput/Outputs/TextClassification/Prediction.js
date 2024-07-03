import React from 'react';
import formatProbability from "./ProbabilityFormatter";
import "./Prediction.scss";
import trim from "../../../../../helpers/labelTrimmer";
import useBEMNaming from "../../../../../common/useBEMNaming";

const defaultProps = {
    className: "prediction",
    feature: {
        classification: {
            label: 'Unknown'
        },
        probability: 1
    }
}

export default function Prediction(givenProps) {
    const props = {...defaultProps, ...givenProps};
    const {getBlock, getElement} = useBEMNaming(props.className);

    return (
        <div className={getBlock()}>
            <div className={getElement('label')}>{trim(props.feature.classification.label)}</div>
            <div className={getElement('probability')}>{formatProbability(props.feature.probability)}</div>
        </div>
    )
}