import React from "react";
import "./ModelTag.scss";
import Task from "../../helpers/Task";
import Framework from "../../helpers/Framework";
import {ReactComponent as Microchip} from "../../resources/icons/microchip-solid.svg";

export default function ModelTag(props) {
  let className = "model-tag";
  if (!!props.type && props.type !== "") {
    className = `${className} -${props.type}`;
  }
  let Icon = (() => <></>);
  let classes = "";
  if (props.type === "task") {
    let task = Task.getStaticTask(props.content);
    Icon = task.Icon;
  }
  if (props.type === "framework") {
    let framework = Framework.getStaticFramework(props.content);
    Icon = framework.Icon;
  }
  if (props.type === "machine") {
    Icon = (props) => <Microchip {...props}></Microchip>
    classes = " model-tag__icon-machine"
  }

  return (
    <span className={className}><Icon className={"model-tag__icon" + classes}/> {props.content}</span>
  );
}
