import React, {useEffect, useState} from "react";
import ModelDetailPage from "../components/ModelDetailPage/ModelDetailPage"
import {useParams, useNavigate} from "react-router-dom";
import GetApiHelper from "../helpers/api";

let experimentSubscription = null;
let trialSubscription = null;
let modelSubscription = null;
let api = GetApiHelper();

export function ModelDetailContainer(props) {
    const [model, setModel] = useState(null);
    const [experiment, setExperiment] = useState(null);
    const [trialOutput, setTrialOutput] = useState(undefined);

    const history = useNavigate();

    const {modelId, experimentId} = useParams();

    const backToModel = () => {
        trialSubscription.unsubscribe();
        experimentSubscription.unsubscribe();
        modelSubscription.unsubscribe();
        history(`/model/${modelId}`, { state: { experiment: setExperiment(null), trialOutput: setTrialOutput(undefined) }});
    }

    const runModel = async (inputUrl, context=null, options={}) => {
        // Note: Adding context param for Conversation task; unsure if needed here
        // Check and confirm later - Alex, 4/10/2024
        const response = await api.runTrial(model, inputUrl, null, context, options);
        history(`/model/${modelId}/experiment/${response.experimentId}`);
    }

    const compareModels = () => {
        history(`/experiment/${experiment.id}`);
    }

    useEffect(() => {
        if (!!experimentId) {
            experimentSubscription = api.getExperiment(experimentId).subscribe({
                next: nextExperiment => {
                    trialSubscription = api.getTrial(nextExperiment.trials[0].id).subscribe({
                        next: nextTrialOutput => setTrialOutput(nextTrialOutput)
                    });
                    setExperiment(nextExperiment);
                }
            });
        }

        return () => {
            if (experimentSubscription)
                experimentSubscription.unsubscribe();
            if (trialSubscription)
                trialSubscription.unsubscribe();
        }
    }, [experimentId]);

    useEffect(() => {
        modelSubscription = api.ActiveModel.subscribe({
            next: (nextModels) => {
                setModel(nextModels[0]);
            }
        });
        api.getModel(modelId);

        return () => {
            if (modelSubscription)
                modelSubscription.unsubscribe();
        }
    }, [modelId]);

    return (
        <ModelDetailPage 
            model={model} 
            onBackToModelClicked={backToModel}
            onRunModelClicked={runModel} 
            trialOutput={trialOutput}
            compare={compareModels}
        />
    )
}

export default ModelDetailContainer;
