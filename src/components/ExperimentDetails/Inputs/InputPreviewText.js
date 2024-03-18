import React from "react";
import useBEMNaming from "../../../common/useBEMNaming";

export function InputPreviewText(props) {
  const { getElement } = useBEMNaming("input-preview");

  let textToDisplay = props.selectedInput;

  if (textToDisplay.length > 32) {
    textToDisplay = textToDisplay.slice(0, 32);
    textToDisplay =
      textToDisplay.slice(0, textToDisplay.lastIndexOf(" ")) + "...";
  }

  return (
    <button
      className={`${getElement("selection-btn")} ${
        props.isOpen && getElement("selection-btn-active")
      }`}
      onClick={props.toggleOpen}
    >
      {textToDisplay}
    </button>
  );
}
