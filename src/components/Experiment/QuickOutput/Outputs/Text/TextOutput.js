import React from "react";
import useBEMNaming from "../../../../../common/useBEMNaming";
import useTextOutput from "./useTextOutput";
import { TextOutputBox } from "./TextOutputBox";
import TextOutputInputSection from "./TextOutputInputSection";

export default function TextOutput(props) {
  const { getBlock } = useBEMNaming("text-output");
  const { output, inferenceDuration, input, setInput } = useTextOutput(
    props.trial
  );

  const onSubmit = () => {
    if (typeof props.onSubmit === "function") {
      props.onSubmit([{ src: input, inputType: "TEXT" }]);
    }
  };

  return (
    <div className={getBlock()}>
      <TextOutputInputSection
        input={input}
        setInput={setInput}
        onSubmit={onSubmit}
      />

      <TextOutputBox duration={inferenceDuration} output={output} />
    </div>
  );
}
