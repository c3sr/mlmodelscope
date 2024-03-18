import useBEMNaming from "../../../../common/useBEMNaming";
import React from 'react';
import BirdPicture from '../../../../resources/img/tutorial-bird-1.png'
import PlantPicture from '../../../../resources/img/tutorial-plant-1.png'
import "./IntroTutorialMachineLearningUses.scss";

export default function IntroTutorialMachineLearningUses(props) {
    const {getElement} = useBEMNaming("intro-tutorial-machine-learning-uses");

    return <>
        <div className={getElement("text-area")}>
            <p className={getElement("intro-text")}>Model intro</p>
            <p className={getElement("title")}>Machine learning is all around you!</p>

            <p className={getElement("sub-title")}>People use machine learning models to help them identify things like
                birds
                or
                plants.</p>

            <button className={getElement("cta")} onClick={() => props.goToSection(props.index + 1)}>
                Let's try it out
            </button>
        </div>
        <div className={getElement("img-area")}>
            <img src={PlantPicture} alt={"plant"} className={getElement("img-1")}/>

            <img src={BirdPicture} alt={"bird"} className={getElement("img-2")}/>
        </div>
    </>
}
