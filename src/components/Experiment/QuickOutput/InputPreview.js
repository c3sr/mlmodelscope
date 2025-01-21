import React from "react";
import "./InputPreview.scss";
import useBEMNaming from "../../../common/useBEMNaming";
import { ReactComponent as DocumentIcon } from "../../../resources/icons/icon-document.svg";

const defaultProps = {
  className: "input-preview",
  input: "",
  onBackClicked: () => { },
  inputType: "image", // TODO: Change this default?
};

export default function InputPreview(givenProps) {
  const props = { ...defaultProps, ...givenProps };
  const { getBlock, getElement } = useBEMNaming(props.className);

  const inputTypes = {
    image: "Image",
    audio: "Audio",
    text: "Text",
    document: "Document",
    video: "Video",
  };


  const getInput = () => {
    switch (props.inputType) {
      case "text":
        let shortened = props.input.src.split(" ").slice(0, 5).join(" ");
        shortened = shortened + (shortened.length < props.input.src.length ? "..." : "");
        return <p className={getElement("text")} title={props.input.src}>{shortened}</p>;
      case "audio":
        return props.input?.src?.title ? <audio className={getElement("audio")} controls src={props.input.src.src} title={props.input.src.title} /> : <audio className={getElement("audio")} controls src={props.input.src} />;
      case "image":
        return <img className={getElement("image")} src={props.input.src} />;
      case "video":
        return <video className={getElement("video")} src={props.input.src} controls />;
      case "document":
        return <button className={getElement("document")}><DocumentIcon className='icon' /><a href={props.input.src} target='_blank' ><span>{props.input.description ?? "Document"}</span></a></button>;

      default:
        return <p>Not currently supported</p>;
    }
  };

  return (
    <div className={getBlock()}>
      {props?.experimentInputPreview ||
        <h3 className={getElement("title")}>
          Input {inputTypes[props.inputType]}
        </h3>
      }
      {getInput()}
      {props?.experimentInputPreview ||
        <button
          className={getElement("back-button")}
          onClick={props.onBackClicked}
        >
          Try a different {inputTypes[props.inputType]?.toLowerCase()}
        </button>}
    </div>
  );
}
