import React from 'react';
import useBEMNaming from "../../../../common/useBEMNaming";
import PlantPicture from '../../../../resources/img/tutorial-plant-1.png'
import "./IntroTutorialPlantPrompt.scss";

export default function IntroTutorialPlantPrompt(props) {
    const {getElement} = useBEMNaming("intro-tutorial-plant-prompt");


    return <>
        <p className={getElement("intro-text")}>Model Input</p>
        <p className={getElement("title")}>Can a machine learning model identify what type of plant this is?</p>
        <div className={getElement("img-wrapper")}>
            <img src={PlantPicture} alt={"plant"} className={getElement("img")}/>
        </div>

        <button className={getElement("cta")} onClick={() => props.goToSection(props.index + 1)}>
            Let's try it out!
        </button>
    </>
}
