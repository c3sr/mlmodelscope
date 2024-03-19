import React from 'react';
import useBEMNaming from "../../../../common/useBEMNaming";
import MachineLearning1 from "../../../../resources/img/intro-illustration-1.png";
import {ReactComponent as Arrow} from "../../../../resources/icons/fat-arrow.svg";
import MachineLearning2 from "../../../../resources/img/intro-illustration-2.png";
import MachineLearning3 from "../../../../resources/img/intro-illustration-3.png";
import "./IntroTutorialMachineLearningOverview.scss";

export default function IntroTutorialMachineLearningOverview(props) {
    const {getElement} = useBEMNaming("intro-tutorial-machine-learning-overview")

    return <>
        <p className={getElement("intro-text")}>
            Model intro
        </p>
        <p className={getElement("title")}>
            Machine learning uses models that are trained to recognize different patterns and make predictions.
        </p>
        <div className={getElement("wrapping-box")}>
            <div className={getElement("background-gradient")}></div>
            <div className={getElement("section-content")}>
                <div className={getElement("content-group")}>
                    <img className={getElement("content-image")} src={MachineLearning1} alt={"Input"}/>
                    <p className={getElement("content-label")}>Input image</p>
                </div>
                <div className={getElement("content-group")}>
                    <Arrow className={getElement("content-arrow")}/>
                    <div></div>
                </div>
                <div className={getElement("content-group")}>
                    <img className={getElement("content-image")} src={MachineLearning2} alt={"Trained model"}/>
                    <p className={getElement("content-label")}>Trained model</p>
                </div>
                <div className={getElement("content-group")}>
                    <Arrow className={getElement("content-arrow")}/>
                    <div></div>

                </div>
                <div className={getElement("content-group")}>
                    <img className={getElement("content-image")} src={MachineLearning3} alt={"Output"}/>
                    <p className={getElement("content-label")}>Output</p>
                </div>
            </div>
        </div>
        <p className={getElement("caption")}> Example of image classification task</p>

        <button className={getElement("cta")} onClick={() => props.goToSection(props.index + 1)}>
            Let's try a real world example
        </button>
    </>
}
