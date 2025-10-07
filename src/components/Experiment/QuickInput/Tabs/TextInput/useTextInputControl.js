import { useState } from "react";
import Task from "../../../../../helpers/Task";

export default function useTextInputControl(props) {
    const task = Task.getStaticTask(props.task);

    const textChanged = async (event, index) => {
        if (event.persist) {
            event.persist();
        }
        let myText = event.target.value;
        if (typeof (props.inputSelected) === "function")
            props.inputSelected(myText, index);
    };
    let values = props.values;
    if (!values || values.length === 0) values = [""];

    return {
        task,
        textChanged,
        values
    };
}