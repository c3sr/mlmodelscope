import useBEMNaming from "../../../common/useBEMNaming";
import useTextOutput from "../../Experiment/QuickOutput/Outputs/Text/useTextOutput";
import React from "react";
import { CodePreview } from "../../Experiment/QuickOutput/Outputs/_Common/components/CodePreview";

export default function TextToCodeSummary(props) {
  const { getBlock, getElement } = useBEMNaming("text-to-code-summary");
  const { output } = useTextOutput(props.trial);

  return (
    <div className={getBlock()}>
      <p className={getElement("subtitle")}>Output:</p>

      <CodePreview>{output}</CodePreview>
    </div>
  );
}
