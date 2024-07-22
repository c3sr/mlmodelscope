import React from 'react';
import useBEMNaming from '../../../../../common/useBEMNaming';
import "./URLInputPreview.scss";
import { TaskInputTypes } from '../../../../../helpers/TaskInputTypes';

const URLInputPreview = (props) => {
    const { getBlock, getElement } = useBEMNaming("url-inputs-preview");

    console.log('URLInputPreview props', props)

    return (
        <>
            {/* Delete later */}
            <p>URL Input preview</p>
            <p>props.selectedInputs: {props.selectedInputs}</p>
            <p>
                props?.inputPreviewProps?.URLValidity: {props?.inputPreviewProps?.URLValidity ? "True" : "False"}
            </p>
            {!(props.selectedInputs.length === 0 || props.selectedInputs[0] === "") && props?.inputPreviewProps?.URLValidity && 
                <div className={getBlock()}>
                    <h3 className={getElement("title")}> Input Preview</h3>
                    <div className={getElement("preview")}>
                        { props.inputType === TaskInputTypes.Image ? 
                        (
                            <img src={props?.inputPreviewProps?.selectedInputSrc} alt="Preview" />
                        ) : props.inputType === TaskInputTypes.Audio ? (
                            <audio controls src={props?.inputPreviewProps?.selectedInputSrc} title="Preview" />
                        ) : <p>Preview not supported for {props.inputType}</p>}

                    </div>
                </div>
            }
        </>
    );
};

export default URLInputPreview;