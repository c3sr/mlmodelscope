import Task from "../../../../../helpers/Task";
import { useState } from "react";
import UrlVerfiy from "../../../../../helpers/UrlVerifier";

export default function useURLInputControl(props) {
  const task = Task.getStaticTask(props.task);

  const [isInvalidUrl, setIsInvalidUrl] = useState([false]);

  const urlChanged = async (event, index) => {
    if (event.persist)
      event.persist();
    const inputType = task.useMultiInput ? (task.inputs.length > 1 ? task.inputs[index].inputType : task.inputs[0].inputType) : task.inputType;

    let url = event.target.value;
    const isValid = await UrlVerfiy(url, inputType);
    setIsInvalidUrl((currentInvalidUrl) => {
      const nextInvalidUrl = [...currentInvalidUrl];
      nextInvalidUrl[index] = !isValid && url !== "";
      return nextInvalidUrl;
    });

    if (typeof (props.inputSelected) === 'function')
      props.inputSelected(isValid ? url : "", index);

    return isValid;
  };

  const getUrlValidity = (index) => isInvalidUrl[index];

  let values = props.values;
  if (!values || values.length === 0) values = [""];

  return { getUrlValidity, task, urlChanged, values };
}
