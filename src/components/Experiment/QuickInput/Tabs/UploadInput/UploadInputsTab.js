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

export default function UploadInputsTab(props) {

  console.log('UploadInputsTab props', props)

  const {getBlock, getElement} = useBEMNaming("upload-inputs");

  const allowedFileTypes = getAllowedFileTypes(props.task);
  const {uppy} = useUploadInputControl({allowedFileTypes: allowedFileTypes, ...props});

  const task = Task.getStaticTask(props.task);
  const taskName = (task.useMultiInput ? (Task.getStaticTask(props.task).inputs[props.inputIndex]?.inputType) : props.type)?.toLowerCase();
  // Currently using both new and old way of handling inputs but should refactor in the future
  const inputText = task.inputText || props.input.inputText;  

  return (
    <div className={getBlock()}>
      <p className={getElement("help-text")}><b>Upload {inputText && "aeiou".includes(inputText[0]?.toLowerCase()) ? " an" : " a"} {taskName} file</b> to {inputText.toLowerCase()} </p>
      <Dashboard uppy={uppy} width={"100%"}/>
      {
        (task.id === maskGeneration && props.selectedInputs[props.inputIndex] !== '') && (
          <>
            Image + Canvas
            <CanvasInput selectInput={props.selectInput} index={props.inputIndex} url={props.selectedInputs[props.inputIndex]} {...props} />
          </>
        )
      }
    </div>
  );
}

