import React from 'react';
import useBEMNaming from '../../../../../common/useBEMNaming';
import "./URLInputPreview.scss";
import { TaskInputTypes } from '../../../../../helpers/TaskInputTypes';
import DrawRectangle from '../SampleInput/DrawRectangle';

const URLInputPreview = (props) => {
    const { getBlock, getElement } = useBEMNaming("url-inputs-preview");

    console.log('URLInputPreview props', props)

    const { task, index } = props
    // console.log('urlinputpreview task', task)
    // console.log('urlinputpreview index', index)
    const inputType = task.useMultiInput ? task.inputs[index].inputType : task.inputType;

    return (
        <>
            {/* Delete later */}
            <p>URL Input preview</p>
            <p>props.selectedInputs: {props.selectedInputs}</p>
            <p>
                props?.inputPreviewProps?.URLValidity: {props?.inputPreviewProps?.URLValidity ? "True" : "False"}
            </p>
            <p>
                Input Type: {inputType}
            </p>
            {!(props.selectedInputs.length === 0 || props.selectedInputs[0] === "") && props?.inputPreviewProps?.URLValidity && 
                <div className={getBlock()}>
                    <h3 className={getElement("title")}> Input Preview</h3>
                    <div className={getElement("preview")}>
                    {/* <DrawRectangle selectInput={() => (console.log)} index={index} url={props?.inputPreviewProps?.selectedInputSrc} {...props} />                                 */}

                        { inputType === TaskInputTypes.Image ? 
                            (
                              <img src={props?.inputPreviewProps?.selectedInputSrc} alt="Preview" />
                            ) : inputType === TaskInputTypes.Audio ? 
                            (
                                <audio controls src={props?.inputPreviewProps?.selectedInputSrc} title="Preview" />
                            ) : inputType === TaskInputTypes.ImageCanvas ?
                            (
                                // TODO: What is selectInput? Need to look at inputPreviewProps and see if we can use setSelectedInputSrc etc
                                 <DrawRectangle selectInput={() => (console.log)} index={index} url={props?.inputPreviewProps?.selectedInputSrc} {...props} />                                
                            ): 
                            (
                                <p>Preview not supported for {inputType}</p>
                            )
                        }
                    </div>
                </div>
            }
        </>
    );
};

export default URLInputPreview;