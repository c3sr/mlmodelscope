import React, { useRef } from 'react';
import "./HomePage.scss";
import useBEMNaming from "../../common/useBEMNaming";
import { HomePageMainSection } from "./HomePageMainSection";
import TutorialSection from "./TutorialSection";
import AboutUs from './AboutUs';

export default function HomePage(props) {
    const { getBlock } = useBEMNaming("home-page");

    const modelDetailsRef = useRef();


    return (
        <div className={getBlock()}>
            <HomePageMainSection modelDetailsRef={modelDetailsRef} />
            <TutorialSection modelDetailsRef={modelDetailsRef} />
            <AboutUs modelDetailsRef={modelDetailsRef} />
            {/*<IntroTutorialMachineLearningOverview modelDetailsRef={otherRef}/>*/}
            {/*<TaskExamples {...props}/>*/}
        </div>
    );
}
