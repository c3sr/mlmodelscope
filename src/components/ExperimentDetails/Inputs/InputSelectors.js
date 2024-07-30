import React from "react";
import { ReactComponent as DeleteIcon } from "../../../resources/icons/delete.svg";
import "./InputSelectors.scss";
import useBEMNaming from "../../../common/useBEMNaming";
import { TaskInputTypes } from "../../../helpers/TaskInputTypes";

export default function InputSelectors(props) {
  const { getBlock, getElement } = useBEMNaming("input-selector");

  const getInputPreviewContent = (input, index) => {
    if (props.task.inputType === TaskInputTypes.Text) return getTextInputPreviewContent(input, index);

    return (
      <>
        <img
          alt={`Input ${index + 1}`}
          className={getElement("input-selector-img")}
          src={input.src}
        />
        Input {index + 1}
      </>
    );
  };

  const getTextInputPreviewContent = (input, index) => {
    let shortened = input.split(" ").slice(0, 5).join(" ");
    shortened = shortened + (shortened.length < input.length ? "..." : "");

    return (
      <>
        <div className={getElement("input-selector-text")}>
          <div className={getElement("input-selector-text__text")}>{shortened}</div>
          <div className={getElement("input-selector-text__label")}>Input {index + 1}</div>
        </div>
      </>
    );
  };

  return (
    <div className={getBlock()}>
      {props.inputs.map((input, idx) => (
        <div
          key={idx}
          className={getElement(
            `input-selector-btn ${idx === props.selectedIndex && "input-selector-btn-selected"
            }`
          )}
        >
          <button
            onClick={() => props.handleSelect(input)}
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
