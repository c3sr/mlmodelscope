import React from 'react';
import useBEMNaming from '../../../../../common/useBEMNaming';
import "./URLInputPreview.scss";
import { TaskInputTypes } from '../../../../../helpers/TaskInputTypes';
import CanvasInput from '../CanvasInput/CanvasInput';

const URLInputPreview = (props) => {
    const { getBlock, getElement } = useBEMNaming("url-inputs-preview");
    const { task, index } = props

    const inputType = task.useMultiInput ? task.inputs[index].inputType : task.inputType;

    return (
        <>
            {/* Delete later */}
            {/* <p>URL Input preview</p>
            <p>Index: {index}</p>
            <p>props.selectedInputs: {props.selectedInputs}</p>
            <p>
                props?.inputPreviewProps?.URLValidity: {props?.inputPreviewProps?.URLValidity ? "True" : "False"}
            </p> */}

            {!(props.selectedInputs.length === 0 || props.selectedInputs[0] === "") && props?.inputPreviewProps?.URLValidity && 
                <div className={getBlock()}>
                    <h3 className={getElement("title")}> Input Preview</h3>
                    <div className={getElement("preview")}>
                        { inputType === TaskInputTypes.Image ? 
                            (
                              <img src={props?.inputPreviewProps?.selectedInputSrc} alt="Preview" />
                            ) : inputType === TaskInputTypes.Audio ? 
                            (
                                <audio controls src={props?.inputPreviewProps?.selectedInputSrc} title="Preview" />
                            ) : inputType === TaskInputTypes.ImageCanvas ?
                            (
                                 <CanvasInput selectInput={props.inputSelected} index={index} url={props?.inputPreviewProps?.selectedInputSrc} {...props} />                                
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