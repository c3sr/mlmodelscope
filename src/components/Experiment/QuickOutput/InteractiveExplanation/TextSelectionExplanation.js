import React, { useEffect, useRef, useState } from "react";
import { useInteractiveExplanation } from "./InteractiveExplanationContext";
import AIExplainAction from "./AIExplainAction";
import "./TextSelectionExplanation.scss";

const defaultQuestion = "What does this mean in the context of this model result?";
const maxSelectedTextLength = 500;
const maxSurroundingTextLength = 500;
const interactiveSelector = [
  "a",
  "button",
  "input",
  "label",
  "select",
  "summary",
  "textarea",
  "nav",
  "[contenteditable='true']",
  "[role='button']",
  "[role='link']",
  "[role='menuitem']"
].join(",");
const meaningfulContainerSelector = [
  "p",
  "li",
  "dt",
  "dd",
  "figcaption",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "article",
  "aside",
  "section",
  "div"
].join(",");

export default function TextSelectionExplanation({ children, model, resultContext }) {
  const rootRef = useRef(null);
  const popoverRef = useRef(null);
  const { selectArtifact } = useInteractiveExplanation();
  const [selectionDetails, setSelectionDetails] = useState(null);

  const inspectSelection = () => {
    const details = getSelectionDetails(rootRef.current, window.getSelection());
    setSelectionDetails(details);
  };

  useEffect(() => {
    const clearWhenSelectionIsRemoved = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed)
        setSelectionDetails(null);
    };
    const clearOnOutsidePointerDown = (event) => {
      if (!popoverRef.current?.contains(event.target))
        setSelectionDetails(null);
    };
    const clearPositionedAction = () => setSelectionDetails(null);

    document.addEventListener("selectionchange", clearWhenSelectionIsRemoved);
    document.addEventListener("pointerdown", clearOnOutsidePointerDown);
    window.addEventListener("resize", clearPositionedAction);
    window.addEventListener("scroll", clearPositionedAction, true);
    return () => {
      document.removeEventListener("selectionchange", clearWhenSelectionIsRemoved);
      document.removeEventListener("pointerdown", clearOnOutsidePointerDown);
      window.removeEventListener("resize", clearPositionedAction);
      window.removeEventListener("scroll", clearPositionedAction, true);
    };
  }, []);

  const explainSelection = () => {
    if (!selectionDetails) return;

    selectArtifact({
      id: `text-selection-${Date.now()}`,
      label: "Selected text",
      kind: "text_selection",
      transient: true,
      selection: {
        text: selectionDetails.text,
        surroundingText: selectionDetails.surroundingText,
        section: selectionDetails.section
      },
      model,
      resultContext
    }, defaultQuestion);
    setSelectionDetails(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div
      ref={rootRef}
      className="text-selection-explanation"
      onMouseUp={inspectSelection}
      onKeyUp={inspectSelection}
    >
      {children}
      {selectionDetails && (
        <span
          ref={popoverRef}
          className={`text-selection-explanation__popover text-selection-explanation__popover--${selectionDetails.placement}`}
          style={{ left: selectionDetails.left, top: selectionDetails.top }}
        >
          <AIExplainAction
            onPointerDown={(event) => event.preventDefault()}
            onClick={explainSelection}
            ariaLabel={`Explain selected text: ${shortenText(selectionDetails.text, 80)}`}
          />
        </span>
      )}
    </div>
  );
}

export function getSelectionDetails(root, selection) {
  if (!root || !selection || selection.rangeCount === 0 || selection.isCollapsed)
    return null;

  const text = selection.toString().trim();
  if (text.length < 2 || text.length > maxSelectedTextLength)
    return null;

  const range = selection.getRangeAt(0);
  const startElement = elementForNode(range.startContainer);
  const endElement = elementForNode(range.endContainer);
  if (!startElement || !endElement || !root.contains(startElement) || !root.contains(endElement))
    return null;
  if (startElement.closest(interactiveSelector) || endElement.closest(interactiveSelector))
    return null;
  const selectedFragment = range.cloneContents();
  if (typeof selectedFragment.querySelector === "function" && selectedFragment.querySelector(interactiveSelector))
    return null;

  const rectangle = range.getBoundingClientRect();
  if (!rectangle || (rectangle.width === 0 && rectangle.height === 0))
    return null;

  const placeAbove = rectangle.bottom + 52 > window.innerHeight;
  return {
    text,
    surroundingText: getSurroundingText(startElement, root, text),
    section: getSectionLabel(startElement, root),
    left: Math.min(Math.max(rectangle.left + rectangle.width / 2, 52), window.innerWidth - 52),
    top: placeAbove ? rectangle.top - 8 : rectangle.bottom + 8,
    placement: placeAbove ? "above" : "below"
  };
}

export function getSurroundingText(startElement, root, selectedText) {
  let current = startElement;
  while (current && root.contains(current)) {
    if (current.matches(meaningfulContainerSelector)) {
      const candidate = normalizeText(current.textContent);
      if (candidate)
        return boundAroundSelection(candidate, selectedText, maxSurroundingTextLength);
    }
    current = current.parentElement;
  }
  return selectedText;
}

export function getSectionLabel(startElement, root) {
  let current = startElement;
  while (current && root.contains(current)) {
    if (current.dataset?.explanationSection)
      return current.dataset.explanationSection;
    if (current.matches("article, aside, section, figure")) {
      const heading = Array.from(current.children).find((child) => /^H[1-6]$/.test(child.tagName));
      if (heading)
        return normalizeText(heading.textContent);
    }
    current = current.parentElement;
  }
  return "Model result";
}

function elementForNode(node) {
  return node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
}

function normalizeText(text) {
  return (text || "").replace(/\s+/g, " ").trim();
}

function boundAroundSelection(text, selectedText, maximumLength) {
  if (text.length <= maximumLength) return text;

  const normalizedSelection = normalizeText(selectedText);
  const selectedIndex = text.toLocaleLowerCase().indexOf(normalizedSelection.toLocaleLowerCase());
  const center = selectedIndex >= 0 ? selectedIndex + normalizedSelection.length / 2 : text.length / 2;
  const excerptLength = maximumLength - 6;
  const start = Math.max(0, Math.min(text.length - excerptLength, Math.round(center - excerptLength / 2)));
  const excerpt = text.slice(start, start + excerptLength).trim();
  return `${start > 0 ? "..." : ""}${excerpt}${start + excerptLength < text.length ? "..." : ""}`;
}

export function shortenText(text, maximumLength) {
  if (text.length <= maximumLength) return text;
  return `${text.slice(0, maximumLength - 3).trim()}...`;
}
