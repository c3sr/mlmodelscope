import React, { useEffect, useState, useMemo } from "react";
import ExperimentDetailPage from "../components/ExperimentDetails/ExperimentDetailPage";
import GetApiHelper from "../helpers/api";
import Task from "../helpers/Task";
import { image_classification } from "../helpers/TaskIDs";
import MultipleSort from "../helpers/MultipleSort";
import { useParams } from "react-router-dom/dist";
import { getTaskFromQueryString } from "../helpers/QueryParsers";


export const ExperimentDetailModalTypes = {
    none: "NONE",
    modelCannotBeRemoved: "MODEL_CANNOT_BE_REMOVED",
    confirmDeleteModel: "MODEL_DELETE_CONFIRM",
    inputCannotBeRemoved: "INPUT_CANNOT_BE_REMOVED",
    confirmDeleteInput: "INPUT_DELETE_CONFIRM",
    addInput: "INPUT_ADD"
};

const trialSubscriptions = [];
let experimentSubscription = null;

export default function ExperimentDetailContainer(props) {
    const api = GetApiHelper();
    const { experimentId } = useParams();
    const task = getTaskFromQueryString(window.location.search);
    const hasLocalStorage = experimentId && localStorage.getItem('experimentTrial')?.experimentId !== null;
    const getTask = () => Task.getStaticTask(task);
    const hasMultipleInputs = getTask()?.useMultiInput ?? getTask()?.inputs?.length > 1;
    const localStorageInput = hasLocalStorage ? JSON.parse(localStorage.getItem('experimentTrial'))?.experimentId?.inputs : [];
    const [inputsProp, setInputsProp] = useState(hasLocalStorage ? (hasMultipleInputs ? JSON.parse(localStorage.getItem('experimentTrial'))?.experimentId?.inputs : JSON.parse(localStorage.getItem('experimentTrial'))?.experimentId?.inputs.flat()) : []);
    const localStorageModels = hasLocalStorage ? JSON.parse(localStorage.getItem('experimentTrial'))?.experimentId?.models : [];
    const [experimentProp, setExperimentProp] = useState({
        id: experimentId,
        trials: localStorageModels.map(model => ({ model: model, inputs: localStorageInput[0] }))
    });


    const [state, updateState] = useState({
        experiment: null,
        trials: [],
        trialToDelete: null,
        trialIsDeleting: false,
        selectedInput: "",
        modalType: ExperimentDetailModalTypes.none
    });

    const setState = (newState) => {
        updateState(s => ({ ...s, ...newState }));
    };



    useEffect(() => {
        getExperiment();
        return () => {
            trialSubscriptions.forEach(s => s.unsubscribe());

            if (experimentSubscription)
                experimentSubscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (state.selectedInput && state.experiment && state.trials.length > 0) {
            makeExperiment();
        }
    }, [state.experiment, state.trials, state.selectedInput]);

    const getSelectedTrials = () => {
        let filtered = state?.trials;
        if (hasMultipleInputs)
            filtered = filtered?.filter(trial => {
                return trial.inputs === state.selectedInput;
            });
        else
            filtered = filtered?.filter(trial => trial.inputs[0].src === state.selectedInput.src);
        const sortingOptions = [
            (a) => a.model.name,
            (a) => a.model.framework.name
        ];

        return MultipleSort(filtered, sortingOptions);
    };

    const getInputs = () => {
        if (hasMultipleInputs)
            return state.trials.map(trial => trial.inputs);
        const allInputs = state?.trials?.map(trial => trial.inputs).flat();
        const uniqueInputs = allInputs?.filter((input, i, a) => a.findIndex(t => t.src === input.src) === i);
        return uniqueInputs;
    };

    useEffect(() => {
        setInputsProp(prev => {
            return prev.map(input => {
                const fetchedInput = getInputs().find(i => i.src === input.src);
                return fetchedInput || input;
            });
        });
    }, [state, state.trials]);



    const makeExperiment = () => {
        setExperimentProp(prev => ({
            id: state.experiment ? state.experiment.id : null,
            trials: prev.trials.map(skeletonTrial => {

                // Find the corresponding fetched trial
                const fetchedTrial = getSelectedTrials().find(
                    trial => trial.model.id === skeletonTrial.model.id
                );

                // If a fetched trial exists, replace the skeleton trial with it
                return fetchedTrial || skeletonTrial;
            }),
        }));


    };
    const updateInput = (newInput) => setState({ selectedInput: newInput });
    const getTrials = (experiment) => {
        experiment.trials.forEach(trial => {
            addTrial(trial.id);
        });
    };
    const showAddInputModal = () => setState({ modalType: ExperimentDetailModalTypes.addInput });
    const showDeleteModal = (trial, modalType) => {
        const isForDeletingModel = modalType === ExperimentDetailModalTypes.confirmDeleteModel;
        const canDelete = isForDeletingModel ? getUniqueModels().length > 1 : inputsProp.length > 1;

        if (canDelete) {
            setState({
                trialToDelete: trial,
                modalType: modalType
            });
        } else {
            setState({
                modalType: isForDeletingModel ?
                    ExperimentDetailModalTypes.modelCannotBeRemoved :
                    ExperimentDetailModalTypes.inputCannotBeRemoved
            });
        }
    };
    const cancelDeleteTrial = () => {
        setState({
            trialToDelete: null,
            modalType: ExperimentDetailModalTypes.none
        });
    };
    const getModelOutputType = () => {
        let modelOutputType = "";
        if (state.trials.length > 0)
            modelOutputType = state.trials[0].model.output.type;
        return modelOutputType;
    };
    const getUniqueModels = () => {
        return state.trials.filter((t, i, a) => a.findIndex(tr => tr.model.id === t.model.id) === i).map(trial => trial.model.id);
    };
    const runTrial = async (modelId, input, context = null) => {

        let fauxModel = { id: modelId, output: { type: getModelOutputType() } };

        // Note: Adding context param for Conversation task; unsure if needed here
        // Check and confirm later - Alex, 4/10/2024
        let trial = await api.runTrial(fauxModel, input, state.experiment.id, context);

        addTrial(trial.trialId);
    };
    const addTrial = (trialId) => {
        if (!trialSubscriptions[trialId]) {
            trialSubscriptions[trialId] = api.getTrial(trialId).subscribe({
                next: trialOutput => {
                    const trials = state.trials;
                    const currentIndex = trials.findIndex(t => t.id === trialOutput.id);
                    if (trialOutput.completed_at || currentIndex === -1) {

                        if (currentIndex === -1) {
                            trials.push(trialOutput);
                        } else {
                            trials[currentIndex] = trialOutput;
                        }

                        setState({ trials, selectedInput: state.selectedInput || (hasMultipleInputs ? trialOutput.inputs : trialOutput.inputs.flat()[0]) });
                    }

                }
            });
        }
    };
    const hasNoInputs = () => {
        const inputs = inputsProp;
        return inputs.length === 0 || inputs[0] === "";
    };
    const addInput = async (input) => {
        let inputs = Array.isArray(input) ? input : [input];
        if (input.some(i => !i.src)) {
            console.log("Invalid input");
            return;
        }

        // removing inputs that are already in the experiment
        if (!hasMultipleInputs) {
            inputs = inputs.filter(input => !inputsProp?.some(i => i.src === input.src));
            if (inputs.length === 0) {
                setState({ modalType: ExperimentDetailModalTypes.none });
                return;
            }
        }
        else if (hasMultipleInputs && inputsProp?.some(i => i.every((v, i) => v.src === input[i].src && v.inputType === input[i].inputType))) {
            return;
        }


        // single input and multiple inputs have different formats
        if (hasMultipleInputs)
            inputs = [inputs];
        else
            inputs = inputs.map(input => [input]);

        if (props.addInput) {
            props.addInput(inputs);
            return;
        }

        const models = getUniqueModels();
        const storedInputs = inputsProp;
        let modelPromises = [];
        inputs.forEach(input => {
            if (storedInputs.indexOf(input) === -1)
                modelPromises = models.map(model => runTrial(model, input));
        });
        await Promise.all(modelPromises);
        setState({ selectedInput: hasMultipleInputs ? inputs[0] : inputs.flat()[0] });

        if (hasNoInputs())
            await removeTrials((trial) => !trial.inputs || trial.inputs[0] === "");
    };
    const confirmDeleteModel = async () => {
        setState({ trialIsDeleting: true });
        setTimeout(async () => {
            const trial = state.trialToDelete;
            try {
                await removeTrials((t) => t.model.id === trial.model.id);
            } catch (err) {
                console.error(err);
                setState({
                    trialToDelete: null,
                    modalType: ExperimentDetailModalTypes.modelCannotBeRemoved
                });
            }
        }, 500);
    };
    const showDeleteInputModal = (input) => {
        if (inputsProp.length > 1) {
            const fauxTrial = { inputs: [input] };
            setState({ trialToDelete: fauxTrial, modalType: ExperimentDetailModalTypes.confirmDeleteInput });
        } else {
            setState({ modalType: ExperimentDetailModalTypes.inputCannotBeRemoved });
        }

    };
    const deleteInput = async () => {
        setState({ trialIsDeleting: true });
        setTimeout(async () => {
            const trial = state.trialToDelete;
            const input = trial.inputs[0];
            try {
                await removeTrials((t) => t.inputs[0] === input);
                if (state.selectedInput === input) {
                    let firstRemainingInput = state.trials.filter(t => t.inputs[0].src !== input)[0].inputs[0].src;
                    setState({
                        selectedInput: firstRemainingInput
                    });
                }
            } catch (err) {
                console.error(err);
                setState({
                    showModelCannotBeRemoved: true,
                    trialToDelete: null
                });
            }
        }, 500);
    };
    const confirmModelCannotBeRemoved = () => {
        setState({
            modalType: ExperimentDetailModalTypes.none
        });
    };
    const getExperiment = async () => {
        if (props.experiment) {
            setState({
                trials: props.experiment.trials,
                experiment: { id: props.experiment.id }
            });
        } else {
            experimentSubscription = api.getExperiment(experimentId).subscribe({
                next: experiment => {
                    getTrials(experiment);
                    setState({ experiment });
                }
            });
        }
    };
    const removeTrials = async (predicate) => {
        const trialsToRemove = state.trials.filter(predicate);
        let promises = trialsToRemove.map(async trial => {
            trialSubscriptions[trial.id].unsubscribe();
            trialSubscriptions[trial.id] = undefined;
            return api.deleteTrial(trial.id);
        });

        await Promise.all(promises);

        setState({
            trials: state.trials.filter((v, i, a) => !predicate(v, i, a)),
            trialToDelete: null,
            modalType: ExperimentDetailModalTypes.none
        });
    };
    return (
        <ExperimentDetailPage experiment={experimentProp}
            onDeleteTrial={showDeleteModal}
            onCancelDeleteTrial={cancelDeleteTrial}
            onConfirmDeleteTrial={confirmDeleteModel}
            trialIsDeleting={state.trialIsDeleting}
            onConfirmModelCannotBeRemoved={confirmModelCannotBeRemoved}
            showModelCannotBeRemoved={state.showModelCannotBeRemoved}
            trialToDelete={state.trialToDelete}
            inputs={inputsProp}
            addInput={addInput}
            updateInput={updateInput}
            getAddModelsLink={() => `/experiment/${state.experiment?.id}/add-models?task=${task}`}
            deleteInput={deleteInput}
            modalType={state.modalType}
            showAddInputModal={showAddInputModal}
            selectedInput={state.selectedInput}
            showDeleteInputModal={showDeleteInputModal}
            task={getTask()}
            hasMultipleInputs={hasMultipleInputs}
            selectedModels={props.selectedModels}
        />
    );
};
