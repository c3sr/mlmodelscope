import React from 'react';
import "./URLInputsTab.scss";
import useBEMNaming from "../../../../../common/useBEMNaming";
import { ReactComponent as PlusSign } from "../../../../../resources/icons/plus-sign.svg";
import useURLInputControl from "./useURLInputControl";
import URLInputPreview from './URLInputPreview';
import { maskGeneration } from '../../../../../helpers/TaskIDs';
import { QuickInputType } from '../../quickInputType';


export default function URLInputsTab(props) {
  const { getBlock, getElement } = useBEMNaming("url-inputs");

  const { urlChanged, getUrlValidity, task, values } = useURLInputControl(props);

  const taskName = task.id === maskGeneration ? QuickInputType.Image : (task.useMultiInput ? (task.inputs[props.inputIndex]?.inputType) : task.inputType || '').toLowerCase();
  const longTaskName = "aeiou".includes(taskName[0]?.toLowerCase()) ? `an ${taskName}` : `a ${taskName}`;
  // Note: Currently using both new and old way of handling inputs but should refactor in the future
  const inputText = task.inputText || props.input.inputText;

  const getInputClassName = (index) => getElement(getUrlValidity(index) ? "url url-error" : "url");

  const inputHandlerForPreview = async (e, index) => {
    const url = e.target.value;
    const isValid = await urlChanged(e, index);
    props?.inputPreviewProps?.setURLValidity(isValid);
    props?.inputPreviewProps?.setSelectedInputSrc(isValid ? url : "");
  };

  // IMPORTANT - When updating the code below, any changes to one <input> will (probably) need to be applied to all of them
  // We have three <input>s below, for regular Tasks, Tasks that use .multiple, and tasks that use .useMultiInput
  return (
    <div className={getBlock()}>
      <div className={getElement('title')}>
        <b>Copy and paste {longTaskName} URL ({taskName} address)</b>
        {" "}to {inputText.toLowerCase()}
      </div>
      {
        task.useMultiInput ? (
          task.multiple ? (
            <>
              {(values).map((value, index) => (
                <div key={`input-tab-${index}`}>
                  <input className={getInputClassName(index)}
                    placeholder={`Paste any ${taskName} URL`}
                    type="url"
                    value={value}
                    onChange={(e) => inputHandlerForPreview(e, index)}
                  />
                  {getUrlValidity(index) &&
                    <p className={getElement("error-text")}>
                      Not a valid URL. Right click on {longTaskName} to copy the {taskName}&nbsp;
                      address.
                    </p>
                  }
                  <URLInputPreview
                    inputPreviewProps={props.inputPreviewProps}
                    task={task}
                    index={index}
                    selectedInputs={props.values}
                    inputSelected={props.inputSelected}
                    inputSrc={value}
                    tab={props.tab}
                  />
                </div>
              )
              )}
              <button onClick={props.addInput} className={getElement("add-btn")}>
                <PlusSign className={getElement("add-btn-icon")} />
                Add another URL
              </button>
            </>
          ) : (
            <>
              <div key={`input-tab-${props.inputIndex}`}>
                <input className={getInputClassName(props.inputIndex)}
                  placeholder={`Paste any ${taskName} URL`}
                  type="url"
                  value={values[props.inputIndex] || ''}
                  onChange={(e) => inputHandlerForPreview(e, props.inputIndex)}
                />
                {getUrlValidity(props.inputIndex) &&
                  <p className={getElement("error-text")}>
                    Not a valid URL. Right click on {longTaskName} to copy the {taskName}&nbsp;
                    address.
                  </p>
                }
                <URLInputPreview
                  inputPreviewProps={props.inputPreviewProps}
                  task={task}
                  index={props.inputIndex}
                  selectedInputs={props.values}
                  inputSelected={props.inputSelected}
                  tab={props.tab}
                  inputSrc={values[props.inputIndex] || "123"}
                />
              </div>
            </>
          )
        ) : (
          <>
            {(values).map((value, index) => (
              <div key={`input-tab-${index}`}>
                <input className={getInputClassName(index)}
                  placeholder={`Paste any ${taskName} URL`}
                  type="url"
                  value={value}
                  onChange={(e) => inputHandlerForPreview(e, index)}
                />
                {getUrlValidity(index) &&
                  <p className={getElement("error-text")}>
                    Not a valid URL. Right click on {longTaskName} to copy the {taskName}&nbsp;address.
                  </p>
                }
                <URLInputPreview
                  inputPreviewProps={props.inputPreviewProps}
                  task={task}
                  index={index}
                  selectedInputs={props.values}
                  inputSelected={props.inputSelected}
                  tab={props.tab}
                  inputSrc={value}
                />
              </div>
            ))}
            {/* {props.multiple && <button onClick={props.addInput} className={getElement("add-btn")}><PlusSign
              className={getElement("add-btn-icon")} /> Add another URL</button>} */}
          </>
        )
      }
    </div>
  );
}
