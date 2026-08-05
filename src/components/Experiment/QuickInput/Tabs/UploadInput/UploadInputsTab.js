import React from 'react';
import {Dashboard} from '@uppy/react';
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import "./UploadInputsTab.scss";
import Task from "../../../../../helpers/Task";
import useBEMNaming from "../../../../../common/useBEMNaming";
import { useUploadInputControl } from "./useUploadInputControl";
import { getAllowedFileTypes } from '../../../../../helpers/UppyFileTypeCheckerPlugin';
import { maskGeneration } from '../../../../../helpers/TaskIDs';
import CanvasInput from '../CanvasInput/CanvasInput';
import { QuickInputType } from '../../quickInputType';

const getSelectedInputSrc = (value) => {
  if (!value)
    return "";
  if (typeof value === "string")
    return value;
  return value.src || "";
};

export default function UploadInputsTab(props) {
  const {getBlock, getElement} = useBEMNaming("upload-inputs");

  const allowedFileTypes = getAllowedFileTypes(props.task);
  const {uppy} = useUploadInputControl({allowedFileTypes: allowedFileTypes, ...props});

  const task = Task.getStaticTask(props.task);
  const taskName = (task.id === maskGeneration) ? QuickInputType.Image : (task.useMultiInput ? (task.inputs[props.inputIndex]?.inputType) : task.inputType)?.toLowerCase();
  const longTaskName = "aeiou".includes(taskName[0]?.toLowerCase()) ? `an ${taskName}` : `a ${taskName}`;

  // Currently using both new and old way of handling inputs but should refactor in the future
  const inputText = task.inputText || props.input.inputText;  
  const selectedValues = task.useMultiInput
    ? [props.values?.[props.inputIndex]]
    : (props.values || []);
  const uploadedInputs = selectedValues
    .map(getSelectedInputSrc)
    .filter(src => src !== "");
  const hasUploadedInputs = uploadedInputs.length > 0;

  return (
    <div className={getBlock()}>
      <p className={getElement("help-text")}><b>Upload {longTaskName} file</b> to {inputText.toLowerCase()} </p>
      <Dashboard uppy={uppy} width={"100%"}/>
      {hasUploadedInputs && (
        <div className={getElement("preview")}>
          <h3 className={getElement("preview-title")}>Uploaded input</h3>
          <div className={getElement("preview-grid")}>
            {uploadedInputs.map((src, index) => (
              <div className={getElement("preview-item")} key={`${src}-${index}`}>
                {taskName === QuickInputType.Image ? (
                  <img src={src} alt={`Uploaded input ${index + 1}`} className={getElement("preview-image")} />
                ) : taskName === QuickInputType.Audio ? (
                  <audio controls src={src} className={getElement("preview-media")} />
                ) : taskName === QuickInputType.Video ? (
                  <video controls src={src} className={getElement("preview-media")} />
                ) : (
                  <a href={src} target="_blank" rel="noreferrer" className={getElement("preview-link")}>
                    Uploaded file {index + 1}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {
        (task.id === maskGeneration && props.selectedInputs[props.inputIndex] !== '') && (
          <>
            <CanvasInput selectInput={props.selectInput} index={props.inputIndex} url={props.selectedInputs[props.inputIndex]} {...props} />
          </>
        )
      }
    </div>
  );
}
