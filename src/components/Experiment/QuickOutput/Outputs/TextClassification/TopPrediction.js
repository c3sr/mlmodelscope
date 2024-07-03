import React from 'react';
import Rating from "./Rating";
import formatProbability from "./ProbabilityFormatter";
import "./TopPrediction.scss";
import trim from "../../../../../helpers/labelTrimmer";
import useBEMNaming from "../../../../../common/useBEMNaming";

const defaultProps = {
    className: "top-prediction",
    feature: {
        classification: {
            label: "Unknown"
        },
        probability: 1.0
    }
}

export default function TopPrediction(givenProps) {
    const props = {...defaultProps, ...givenProps};

    const {getElement, getBlock} = useBEMNaming(props.className);

    const getPredictionLabel = () => {
        return trim(props.feature.classification.label);
    }

    const getPredictionProbability = () => {
        return formatProbability(props.feature.probability);
    }

    return (
        <div className={getBlock()}>
            <div className={getElement("prediction")}>{getPredictionLabel(props)}</div>
            <div className={getElement("probability")}>{getPredictionProbability(props)}</div>
            {!props.hideRating &&
                <Rating/>
            }
        </div>
    )
}