import React from 'react';
import './PendingOutput.scss';
import useBEMNaming from "../../../../../common/useBEMNaming";

const defaultProps = {
    className: 'pending-output'
};

export default function PendingOutput(givenProps) {
    const props = {...defaultProps, ...givenProps};
    const {getBlock, getElement} = useBEMNaming(props.className);

    return (
        <div className={getBlock()}>
            <h3 className={getElement('title')}>Output</h3>
            <div className={getElement('subtitle')}>Fetching results...</div>
            {props.unsupportedModel &&
                <div className={getElement('subtitle')}>Warning: unsupported model</div>
            }
            <div className={getElement('spinner-container')}>
                <div className={getElement('spinner')}></div>
                <p className={getElement("spinner-text")}>This could take a few minutes...</p>
            </div>
        </div>
    );
}