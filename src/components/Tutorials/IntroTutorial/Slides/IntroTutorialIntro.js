import useBEMNaming from "../../../../common/useBEMNaming";
import React from "react";
import "./IntroTutorialIntro.scss";

export default function IntroTutorialIntro(props) {
    const {getElement} = useBEMNaming("intro-tutorial-intro");


    return <>
        <p className={getElement("intro-text")}>Model intro</p>
        <h1 className={getElement("title")}>What are machine learning models?</h1>
        <button className={getElement("cta")} onClick={() => props.goToSection(props.index + 1)}>Let's start learning
        </button>
    </>
}
