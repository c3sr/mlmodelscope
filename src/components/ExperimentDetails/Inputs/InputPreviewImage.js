import useBEMNaming from "../../../common/useBEMNaming";
import React from "react";

export function InputPreviewImage(props) {
  const { getElement } = useBEMNaming("input-preview");

  return (
    <button
      className={getElement(
        `selection-btn ${props.isOpen && "selection-btn-active"}`
      )}
      onClick={props.toggleOpen}
    >
      <img
        className={getElement(`selection-btn-img`)}
        alt={"selection"}
        src={props.selectedInput}
      />{" "}
      Input {props.selectedIndex + 1}
    </button>
  );
}
