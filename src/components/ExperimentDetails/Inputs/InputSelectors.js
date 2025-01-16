import React from "react";
import { ReactComponent as DeleteIcon } from "../../../resources/icons/delete.svg";
import "./InputSelectors.scss";
import useBEMNaming from "../../../common/useBEMNaming";
import InputPreview from "../../Experiment/QuickOutput/InputPreview";
import MultiInputPreview from "../../Experiment/QuickOutput/MultiInputPreview";

export default function InputSelectors(props) {
  const { getBlock, getElement } = useBEMNaming("input-selector");
  const getInputPreviewContent = (inputs, index) => {
    return (
      <>
        {props.task?.inputs?.length > 1 ?
          <MultiInputPreview inputs={inputs} experimentInputPreview={true} className={getElement("input-preview")} />
          :
          <InputPreview
            input={inputs}
            inputType={inputs.inputType.toLowerCase()}
            experimentInputPreview={true}
            className={getElement("input-preview")}
          />
        }
        Input {index + 1}
      </>
    );
  };

  return (
    <div className={getBlock()}>
      <div className={getElement("input-selector-container")}>
        {props.inputs && props.inputs.map((input, idx) => (
          <div
            key={idx}
            className={getElement(
              `input-selector-btn ${idx === props.selectedIndex && "input-selector-btn-selected"
              }`
            )}
          >
            <button
              onClick={() => props.handleSelect(input, idx)}
              className={getElement("input-selector-btn-content")}
            >

              {getInputPreviewContent(input, idx)}
            </button>
            <button
              onClick={() => props.showDeleteInputModal(input)}
              className={getElement(
                `input-selector-delete ${idx === props.selectedIndex && "input-selector-delete-selected"
                }`
              )}
            >
              <DeleteIcon />
            </button>
          </div>
        ))}
      </div>
      <div className={getElement("add-input-area")}>
        <button
          onClick={props.showAddInputModal}
          className={getElement("add-input-area-btn")}
        >
          Add Input
        </button>
      </div>
    </div>
  );
}
