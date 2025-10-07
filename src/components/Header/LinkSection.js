import React, { useEffect, useRef, useState } from "react";
import { ReactComponent as RightArrowIcon } from "../../resources/icons/arrow-right-white.svg";
import { ReactComponent as ChevronDown } from "../../resources/icons/chevron-down-white.svg";
import { LinkItem } from "./LinkItem";

export function LinkSection({ getElement, isResponsiveMenu, link, display, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState(0);

  const ref = useRef();

  const toggleSection = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (ref.current)
      setHeight(isOpen ? ref.current.scrollHeight : 0);
  }, [isOpen]);

  const getButtonClassName = () =>
    isOpen ?
      getElement("library-link-container-expand library-link-container-expand-rotated") :
      getElement("library-link-container-expand");


  const getChildContainerClassName = () => {
    let classList = ["responsive-menu-children"];
    const add = (name) => classList.push(`responsive-menu-children-${name}`);

    if (isOpen) add("open");

    return getElement(classList.join(" "));
  };


  if (isResponsiveMenu)
    return <>
      <div onClick={() => {
        if (!link) toggleSection();
      }
      } className={getElement("responsive-menu-section responsive-menu-header")}>
        <div className={getElement("responsive-menu-item ")}>
          <a className={getElement("library-link")} href={link}>{display}</a>
          {link &&
            <RightArrowIcon className={getElement("arrow-icon")} />}
        </div>
        <button onClick={toggleSection} className={getButtonClassName()}>
          <ChevronDown fill={"white"} />
        </button>
      </div>
      <div style={{}} ref={ref} className={getChildContainerClassName()}>
        {children}
      </div>
    </>;


  return <LinkItem link={link} display={display} isResponsiveMenu={isResponsiveMenu} getElement={getElement} />;
}
