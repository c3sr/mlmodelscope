import React from "react";
import useBEMNaming from "../../../../common/useBEMNaming";
import {ReactComponent as InfoIcon} from "../../../../resources/icons/info-icon.svg";
import {ReactComponent as CompareGraphic} from "../../../../resources/icons/compare-graphic.svg";
import {ReactComponent as FatArrow} from "../../../../resources/icons/fat-arrow.svg";
import {ReactComponent as QuestionIcon} from "../../../../resources/icons/question-icon.svg";
import "./IntroTutorialComparingModels.scss";
import PlantPicture from '../../../../resources/img/tutorial-plant-1.png'

export default function IntroTutorialComparingModels(props) {
    const {getElement} = useBEMNaming("intro-tutorial-comparing-models");

    return <>
        <p className={getElement("intro-text")}>Comparing Models</p>
        <p className={getElement("title")}>Modelers will often compare models to identify which one they want to
            use.</p>


        <div className={getElement("graphic")}>
            <div className={getElement("graphic-top")}>

                <div className={getElement("gradient-border")}></div>
                <img className={getElement("graphic-img")} alt={"plant"} src={PlantPicture}/>
                <FatArrow className={getElement("graphic-arrow graphic-arrow-left")}/>
                <FatArrow className={getElement("graphic-arrow graphic-arrow-right")}/>
            </div>
            <div className={getElement("graphic-bottom")}>

                <div className={getElement("graphic-output graphic-output-left")}>
                    <p className={getElement("graphic-output-text")}>
                        Model 1
                    </p>
                    <div className={getElement("graphic-output-results")}>
                        <p className={getElement("graphic-output-results-heading")}>Snake Plant</p>
                        <p className={getElement("graphic-output-results-text")}>
                            90%
                        </p>
                    </div>

                </div>

                <div className={getElement("graphic-output graphic-output-right")}>
                    <p className={getElement("graphic-output-text")}>
                        Model 2
                    </p>
                    <div className={getElement("graphic-output-results")}>
                        <QuestionIcon className={getElement("question-icon")}/>
                    </div>

                </div>
            </div>

        </div>
        <CompareGraphic className={getElement("compare-graphic")}/>

        <div className={getElement("explanation")}>
            <InfoIcon className={getElement("explanation-info")}/>
            <p className={getElement("explanation-text")}>
                Remember our output for <b>Model 1?</b> Let’s try running our image through another model
                and <b> compare the
                two outputs </b> to see which one can better identify the Snake Plant.
            </p>

        </div>

        <button className={getElement("cta")} onClick={() => props.goToSection(props.index + 1)}>
            Let’s compare these models
        </button>
    </>
}
