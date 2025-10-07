import useBEMNaming from "../../../common/useBEMNaming";
import React, { useEffect, useRef, useState } from "react";
import "./ExperimentInputs.scss";
import Button from "../../Buttons/Button"; import NoInputs from "./NoInputs";
import InputSelectors from "./InputSelectors";

export const ExperimentInputs = (props) => {
  const { getBlock, getElement } = useBEMNaming("experiment-inputs");

  const [isOpen, setIsOpen] = useState(false);

  const handlerRef = useRef(null);

  const close = () => setIsOpen(false);

  useEffect(() => {
    function handleClick(event) {
      if (handlerRef.current && !handlerRef.current.contains(event.target))
        close();
    }

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen]);

  const selectedIndex = props.selectedInput && (props.hasMultipleInputs ? props.inputs.indexOf(props.selectedInput) : props.inputs.findIndex(input => input.src === props.selectedInput.src));

  const hasNoInputs = !props.inputs || props.inputs.length === 0 || props.inputs[0] === "";

  const handleSelect = (input, idx) => {
    setIsOpen(false);
    props.selectInput(input, idx);
  };

  if (hasNoInputs)
    return <NoInputs showAddInputModal={props.showAddInputModal} />;

  return (
    <div className={getBlock()}>
      <div ref={handlerRef} className={getElement("selection-area")}>

        <Button
          content={"Add model"}
          icon="plus"
          isPrimary={false}
          isSmall={false}
          link={props.getAddModelsLink(props)}
        />

        <InputSelectors
          inputs={props.inputs}
          selectedIndex={selectedIndex}
          handleSelect={handleSelect}
          showAddInputModal={props.showAddInputModal}
          showDeleteInputModal={props.showDeleteInputModal}
          task={props.task}
          hasMultipleInputs={props.hasMultipleInputs}
        />

      </div>


    </div>
  );
};
