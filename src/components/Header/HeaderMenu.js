import React from "react";
import { LinkItem } from "./LinkItem";
import { LinkSection } from "./LinkSection";
import Task from "../../helpers/Task";

export function HeaderMenu(props) {

  if (props.testMenus)
    return (
      <>
        <LinkSection link={"/test"} display={"Menu Item 1"} {...props}>
          <LinkItem link={"/test"} display={"Submenu Item 1"} isSubMenu {...props} />
          <LinkItem link={"/test"} display={"Submenu Item 2"} isSubMenu {...props} />
          <LinkItem link={"/test"} display={"Submenu Item 3"} isSubMenu {...props} />
          <LinkItem link={"/test"} display={"Submenu Item 4"} isSubMenu {...props} />
          <LinkItem link={"/test"} display={"Submenu Item 5"} isSubMenu {...props} />
        </LinkSection>
        <LinkItem link={"/test"} display={"Menu Item 2"} {...props} />
        <LinkSection link={"/test"} display={"Menu Item 3"} {...props}>
          <LinkItem link={"/test"} display={"Submenu Item 1"} isSubMenu {...props} />
          <LinkItem link={"/test"} display={"Submenu Item 2"} isSubMenu {...props} />
          <LinkItem link={"/test"} display={"Submenu Item 3"} isSubMenu {...props} />
          <LinkItem link={"/test"} display={"Submenu Item 4"} isSubMenu {...props} />
        </LinkSection>
      </>);

  const tasks = Task.getStaticTasks();

  return (
    <>

      <LinkSection display={"Start a model comparison models"} {...props}>
        <p className={props.getElement("submenu-header")}>Choose a task to use for your comparison</p>
        {tasks.map(task => <LinkItem key={task.id} link={`/experiment/new?task=${task.id}`} isSubMenu display={<>
          <task.Icon className={props.getElement("submenu-icon")} />
          {task.name}</>} {...props} />)}
      </LinkSection>
      <LinkItem
        {...props}
        link={"/intro-tutorial"}
        display={"Intro to MLModelscope"}
      />
      <LinkItem
        {...props}
        link={"/about-us"}
        display={"About Us"}
      />
      <LinkItem
        link={"/models"}
        display={"All models"}
        {...props}
      />
    </>);
}
