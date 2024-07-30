import React from "react";
import useBEMNaming from "../../../../../common/useBEMNaming";
// import Task from "../../../../../helpers/Task";
// import { maskGeneration } from "../../../../../helpers/TaskIDs";
import SemanticSegmentation from "../SemanticSegmentation/SemanticSegmentation";
import Rating from "../Classification/Rating";

import "./MaskGeneration.scss";
import "../../../QuickInput/Tabs/CanvasInput/CanvasInput.scss"


export default function MaskGenerationOutput(props) {
    const { getElement, getBlock } = useBEMNaming('mask-generation-output');

    // const task = Task.getStaticTask(maskGeneration);

    // const inputs = props.trial?.inputs ?? [];
    // const output = props.trial?.results?.responses[0]?.features[0] ?? {};
    // console.log("output", output)
    // const duration = props.trial?.results?.duration_for_inference ?? "0s";

    return (
        <div className={getBlock()}>
            <div className={getElement("header")}>
                <div className={getElement("header-row")}>
                    <h3 className={getElement("header-heading")}>Try This Model</h3>
                </div>
            </div>

            <SemanticSegmentation {...props} />

            <Rating />
        </div>
    )
}
