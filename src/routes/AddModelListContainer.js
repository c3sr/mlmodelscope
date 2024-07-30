import React, { useEffect, useState } from "react";
import ModelListContainer from "./ModelListContainer";

let experimentSubscription = null;
let trialSubscriptions = [];

export default function AddModelListContainer(props) {
    const [trials, setTrials] = useState([]);
    const [experiment, setExperiment] = useState(null);

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
            props.history.push(`/experiment/${experiment.id}`);
        });
    };

    const getInputsFromTrials = () => {
        return trials.filter((t, i, a) => a.findIndex(tr => tr.inputs[0] === t.inputs[0]) === i).map(trial => trial.inputs[0]);
    };

    const getModelsFromTrials = () => {
        return trials.map(t => t.model);
    };

    useEffect(() => {
        getExperiment(props.match.params.experimentId);

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
