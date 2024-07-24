import React from 'react';
import useBEMNaming from '../../../../../common/useBEMNaming';
import "./URLInputPreview.scss";
import { TaskInputTypes } from '../../../../../helpers/TaskInputTypes';
import ReactPlayer from 'react-player';

const URLInputPreview = (props) => {
    const { getBlock, getElement } = useBEMNaming("url-inputs-preview");
    console.log('props', props);
    return (
        <>
            {!(props.selectedInputs.length === 0 || props.selectedInputs[0] === "") && props?.inputPreviewProps?.URLValidity && <div className={getBlock()}>
                <h3 className={getElement("title")}> Input Preview</h3>
                <div className={getElement("preview")}>
                    {props.inputType === TaskInputTypes.Image ? (
                        <img src={props?.inputPreviewProps?.selectedInputSrc} alt="Preview" />
                    ) : props.inputType === TaskInputTypes.Audio ? (
                        <audio controls src={props?.inputPreviewProps?.selectedInputSrc} title="Preview" />
                    ) : props.inputType === TaskInputTypes.Video ? (
                        <ReactPlayer url={props?.inputPreviewProps?.selectedInputSrc} controls />
                    ) :
                        null}

                </div>
            </div>}
        </>
    );
};

export default URLInputPreview;