import React, { useEffect, useState } from "react";
import ModelListContainer from "./ModelListContainer";
import { useLocation, useNavigate } from "react-router-dom";
import getExperimentId from "../helpers/getExperimentId";
import GetApiHelper from "../helpers/api";

let experimentSubscription = null;
let trialSubscriptions = [];

export default function AddModelListContainer(props) {
    const [trials, setTrials] = useState([]);
    const [experiment, setExperiment] = useState(null);
    const location = useLocation();
    const experimentID = getExperimentId(location);
    const api = GetApiHelper();
    const navigate = useNavigate();


    const getTrials = (experiment) => {
        experiment.trials.forEach(trial => {
            trialSubscriptions.push(api.getTrial(trial.id).subscribe({
                next: trialOutput => {
                    setTrials(oldState => {
                        const alreadyExists = oldState.findIndex(t => t.id === trialOutput.id) > -1;

                        if (!alreadyExists) {
                            return [...oldState, trialOutput];
                        }
                        return oldState;
                    });
                }
            }));
        });
    };

    const getExperiment = (experimentId) => {
        experimentSubscription = api.getExperiment(experimentId).subscribe({
            next: experiment => {
                getTrials(experiment);
                setExperiment(experiment);
            }
        });
    };

    const getCurrentTask = () => {
        let trial = trials[0];
        if (trial)
            return trial.model.output.type;
        return "";
    };

    const runModels = (selectedModels) => {
        const modelsFromTrials = getModelsFromTrials();
        const filteredSelectedModels = selectedModels.filter(model => {
            return !modelsFromTrials.some(m => m.id === model.id);
        });

        const inputs = getInputsFromTrials();

        const trialPromises = filteredSelectedModels.map((model) => {
            return inputs.map(inputUrl => api.runTrial(model, inputUrl, experiment.id));
        }).flat();

        Promise.all(trialPromises).then(() => {
            navigate(`/experiment/${experimentID}`);
        });
    };

    const getInputsFromTrials = () => {
        return trials.filter((t, i, a) => a.findIndex(tr => tr.inputs[0] === t.inputs[0]) === i).map(trial => trial.inputs[0]);
    };

    const getModelsFromTrials = () => {
        return trials.map(t => t.model);
    };

    useEffect(() => {
        getExperiment(experimentID);

        return () => {
            trialSubscriptions.forEach(s => s.unsubscribe());

            if (experimentSubscription)
                experimentSubscription.unsubscribe();
        };
    }, []);

    return (
        <ModelListContainer task={getCurrentTask()} hideTaskFilters add={true} runModels={(selectedModels) => {
            runModels(selectedModels);
        }} selectedModels={getModelsFromTrials()} />
    );
}
