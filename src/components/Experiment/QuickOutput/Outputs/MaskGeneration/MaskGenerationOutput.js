import React from "react";

// import { Canvas } from '@react-three/fiber'
// import { OrbitControls } from '@react-three/drei'

import useBEMNaming from "../../../../../common/useBEMNaming";
import Task from "../../../../../helpers/Task";
import { maskGeneration } from "../../../../../helpers/TaskIDs";

import MultiInputPreview from "../../MultiInputPreview";
import Rating from "../Classification/Rating";
import OutputDuration from "../_Common/components/OutputDuration";

// import "./ImageTo3D.scss";
import "../../../QuickInput/Tabs/CanvasInput/CanvasInput.scss"


export default function MaskGenerationOutput(props) {
    const { getElement, getBlock } = useBEMNaming('mask-generation');

    const task = Task.getStaticTask(maskGeneration);

    const inputs = props.trial?.inputs ?? [];
    const output = props.trial?.results?.responses[0]?.features[0] ?? {};
    console.log("output", output)
    const duration = props.trial?.results?.duration_for_inference ?? "0s";

    return (
        <div className={getBlock()}>
            <div className={getElement("header")}>
                <div className={getElement("header-row")}>
                    <h3 className={getElement("header-heading")}>Try This Model</h3>
                </div>
            </div>

            <div className={getElement("content")}>
                {/* <div className={getElement("input-and-rating")}>
                    <MultiInputPreview inputs={inputs} onBackClicked={props.onBackClicked} />
                </div> */}

                <div className={getElement("output")}>
                    <div className={getElement("output-title-row")}>
                        <h3 className={getElement('title')}>Output</h3>
                        <OutputDuration duration={duration}/>
                    </div>  
                    <p className={getElement("output-subtitle")}>
                        {task.outputText}
                    </p>
                    {/* <p className={getElement("output-help-text")}>
                        Hover over the model and scroll to zoom, click-and-hold to rotate, right-click-and-hold to drag
                    </p>                         */}
                    <div className={getElement("output-model")}>
                        <div className="parent">
                            <img src={output.src} className="image1" />
                            <div 
                                className="image2" 
                                style={
                                    { 
                                        left: output.xmin,
                                        width: output.xmax,                                        
                                        top: output.ymin, 
                                        height: output.ymax,
                                        opacity: "25%",
                                        backgroundColor: "green"
                                    }
                                }
                            />
                        </div>
                    </div>

                    <Rating />  
                </div>
            </div>
        </div>
    )
}
