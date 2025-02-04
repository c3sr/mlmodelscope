import React from "react";
import Task from "../../helpers/Task";
import ModelTag from "../Common/ModelTag";
import {ReactComponent as CloseIcon} from "../../resources/icons/x.svg";
import './_SelectedModelCard.scss';
import useBEMNaming from "../../common/useBEMNaming";

const defaultProps = {
    className: "selected-model-card",
    remove: () => {
    },
}

export default function SelectedModelCard(givenProps) {
    const props = {...defaultProps, ...givenProps};

    const {getBlock, getElement} = useBEMNaming(props.className);

    const model = props.model;
    let task = Task[model.output.type];
    if (!task) {
        task = new Task({name: model.output.type, description: "This task has no definition"});
    }
    let machineTagKey = 0;
    let architectures = model.framework ? model.framework.architectures : null;
    let machineTags = architectures ? architectures.map(machine => <ModelTag key={machineTagKey++} type="machine"
                                                                             content={machine.name}/>) : '';

    return (
        <div className={getBlock()}>
        <span className={getElement('name')}>
          {model.name}
        </span>
            <div className={getElement('tags')}>
                <div className={getElement('tag-group')}>
                    <span className={getElement('tag-label')}>Framework:</span>
                    <span className={getElement('tag-content')}>
              <ModelTag type="framework" content={model.framework.name}/>
            </span>
                </div>
                <div className={getElement('tag-group')}>
                    <span className={getElement('tag-label')}>Machine:</span>
                    <span className={getElement('tag-content')}>
              {machineTags}
            </span>
                </div>
            </div>
            { !props?.doneChoosingModels && <button className={getElement('close')} onClick={props.remove}>
                <CloseIcon />
            </button> }
        </div>
    )
}
