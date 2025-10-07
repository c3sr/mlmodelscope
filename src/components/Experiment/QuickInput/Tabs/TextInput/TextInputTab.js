import React from "react";
import "./TextInputTab.scss";
import useBEMNaming from "../../../../../common/useBEMNaming";
import useTextInputControl from "./useTextInputControl";
import { ReactComponent as PlusSign } from "../../../../../resources/icons/plus-sign.svg";

export default function TextInputTab(props) {
    const { getBlock, getElement } = useBEMNaming('text-input');
    const { task, textChanged, values } = useTextInputControl(props);
    const inputText = (task.inputText.toLowerCase()) || props?.input?.inputText?.toLowerCase();
    return (
        <div className={getBlock()}>
            <div className={getElement("title")}>
                <b>Enter text</b> to {inputText}
            </div>

            {
                task.useMultiInput ? (
                    task.multiple ? (
                        <>
                            {(values).map((value, index) => (
                                <div key={`input-tab-${index}`}>
                                    <textarea
                                        value={value}
                                        className={getElement("input")}
                                        onChange={(e) => textChanged(e, index)}
                                    ></textarea>
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
                                <textarea
                                    value={values[props.inputIndex] || ''}
                                    className={getElement("input")}
                                    onChange={(e) => textChanged(e, props.inputIndex)}
                                ></textarea>
                            </div>
                        </>
                    )
                ) : (
                    <>
                        {(values).map((value, index) => (
                            <div key={`input-tab-${index}`}>
                                <textarea
                                    value={value}
                                    className={getElement("input")}
                                    onChange={(e) => textChanged(e, index)}
                                ></textarea>
                            </div>
                        ))}
                        {props.multiple && <button onClick={props.addInput} className={getElement("add-btn")}><PlusSign
                            className={getElement("add-btn-icon")} /> Add another URL</button>}
                    </>
                )
            }
        </div>
    );
}