import Task from "../../../../../helpers/Task";
import { useState } from "react";
import UrlVerfiy from "../../../../../helpers/UrlVerifier";

export default function useURLInputControl(props) {
  const task = Task.getStaticTask(props.task);

  const [isInvalidUrl, setIsInvalidUrl] = useState([false]);

  const urlChanged = async (event, index) => {
    if (event.persist)
      event.persist();
    const inputType = task.useMultiInput ? task.inputs[index].inputType : task.inputType;
    let url = event.target.value;
    let tempUrl = event.target.value;
    UrlVerfiy(tempUrl, inputType).then((result) => {
      tempUrl = result ? tempUrl : "";
      let currentInvalidUrl = isInvalidUrl;
      currentInvalidUrl[index] = tempUrl === "" && url !== "";
      setIsInvalidUrl(currentInvalidUrl);
    });


    if (typeof (props.inputSelected) === 'function')
      props.inputSelected(url, index);
  };

  const getUrlValidity = (index) => isInvalidUrl[index];

  let values = props.values;
  if (!values || values.length === 0) values = [""];

  return { getUrlValidity, task, urlChanged, values };
}
