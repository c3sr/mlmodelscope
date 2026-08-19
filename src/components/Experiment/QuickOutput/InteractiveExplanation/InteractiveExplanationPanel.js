import React, { useEffect, useRef } from "react";
import { ReactComponent as CloseIcon } from "../../../../resources/icons/x.svg";
import useBEMNaming from "../../../../common/useBEMNaming";
import { useInteractiveExplanation } from "./InteractiveExplanationContext";
import useExplanationSpeech from "./useExplanationSpeech";
import "./InteractiveExplanationPanel.scss";

export default function InteractiveExplanationPanel() {
  const { getBlock, getElement } = useBEMNaming("interactive-explanation");
  const {
    selectedArtifact,
    isOpen,
    closePanel,
    expertiseLevel,
    setExpertiseLevel,
    question,
    setQuestion,
    askQuestion,
    answer,
    status,
    error
  } = useInteractiveExplanation();
  const closeButtonRef = useRef(null);
  const {
    isSupported: isSpeechSupported,
    isSpeaking,
    speak,
    stop: stopSpeaking
  } = useExplanationSpeech();
  const selectedArtifactId = selectedArtifact?.id;

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, closePanel]);

  useEffect(() => {
    stopSpeaking();
  }, [selectedArtifactId, stopSpeaking]);

  useEffect(() => {
    if (!isOpen || status === "loading") stopSpeaking();
  }, [isOpen, status, stopSpeaking]);

  useEffect(() => {
    if (!answer) stopSpeaking();
  }, [answer, stopSpeaking]);

  if (!isOpen || !selectedArtifact) return null;

  const suggestions = getSuggestions(selectedArtifact);
  const actionLabel = status === "loading"
    ? "Asking..."
    : status === "error" ? "Try again" : "Ask";
  const speechText = answer ? buildSpeechText(answer) : "";

  return (
    <div className={getElement("backdrop")}>
      <section className={getBlock()} role="dialog" aria-modal="true" aria-labelledby="interactive-explanation-title">
        <div className={getElement("header")}>
          <div className={getElement("header-copy")}>
            <p className={getElement("eyebrow")}>AI explanation</p>
            <h3 id="interactive-explanation-title" className={getElement("title")}>
              {selectedArtifact.label || "Ask about this result"}
            </h3>
            <p className={getElement("target")}>{describeTarget(selectedArtifact)}</p>
          </div>
          <div className={getElement("header-actions")}>
            <span className={getElement("provider")}><span aria-hidden="true">✦</span> Gemini</span>
            <button
              ref={closeButtonRef}
              type="button"
              className={getElement("close")}
              onClick={closePanel}
              aria-label="Close AI explanation panel"
            >
              <CloseIcon aria-hidden="true" />
            </button>
          </div>
        </div>

        <form className={getElement("form")} onSubmit={askQuestion}>
          <div className={getElement("controls")}>
            <label className={getElement("level-label")}>
              Explanation level
              <select
                className={getElement("level-select")}
                value={expertiseLevel}
                onChange={(event) => setExpertiseLevel(event.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </label>
          </div>
          <div className={getElement("suggestions")}>
            <p className={getElement("section-label")}>Suggested questions</p>
            <div className={getElement("suggestion-list")}>
              {suggestions.map((suggestion) => (
                <button
                  className={getElement("suggestion")}
                  key={suggestion}
                  type="button"
                  onClick={() => setQuestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          <div className={getElement("question")}>
            <label className={getElement("section-label")} htmlFor="interactive-explanation-question">
              Ask about this explanation
            </label>
            <div className={getElement("composer")}>
              <textarea
                id="interactive-explanation-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="What would you like to understand?"
                rows={3}
              />
              <div className={getElement("composer-footer")}>
                <span>Gemini uses the selected result context.</span>
                <button
                  className={getElement("submit")}
                  type="submit"
                  disabled={status === "loading" || !question.trim()}
                >
                  {actionLabel}
                </button>
              </div>
            </div>
          </div>
        </form>

        {status === "loading" && (
          <p className={getElement("status")} role="status">Gemini is reviewing this result...</p>
        )}
        {status === "error" && <p className={getElement("error")} role="alert">{error}</p>}
        {status === "success" && answer && (
          <div className={getElement("answer")} aria-live="polite">
            <div className={getElement("answer-header")}>
              <h4 className={getElement("answer-title")}>Answer</h4>
              {isSpeechSupported && (
                <button
                  type="button"
                  className={getElement("listen")}
                  onClick={() => isSpeaking ? stopSpeaking() : speak(speechText)}
                  aria-label={isSpeaking ? "Stop reading the AI explanation" : "Listen to the AI explanation"}
                >
                  <span aria-hidden="true">{isSpeaking ? "■" : "▶"}</span>
                  {isSpeaking ? "Stop" : "Listen"}
                </button>
              )}
            </div>
            <p className={getElement("answer-body")}>{answer.answer}</p>
            {answer.limitations?.length > 0 && (
              <div className={getElement("limitations")}>
                <h5 className={getElement("limitations-title")}>{getLimitationsHeading(expertiseLevel)}</h5>
                <ul className={getElement("limitations-list")}>
                  {answer.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function getLimitationsHeading(expertiseLevel) {
  return {
    beginner: "Keep in mind",
    intermediate: "Limitations",
    expert: "Technical limitations"
  }[expertiseLevel] || "Limitations";
}

function buildSpeechText(answer) {
  return [answer.answer, ...(answer.limitations || [])].filter(Boolean).join(". ");
}

function describeTarget(artifact) {
  if (artifact.kind === "text_selection")
    return `Explaining: "${shortenSelectedText(artifact.selection?.text || "Selected text")}"`;
  if (artifact.kind === "token_decision") {
    const token = displayToken(artifact.selection?.token);
    const step = typeof artifact.selection?.position === "number"
      ? ` at generation step ${artifact.selection.position + 1}`
      : "";
    return `Explaining: token "${token}"${step}`;
  }
  if (artifact.kind === "diarization_segment")
    return `Explaining: ${describeDiarizationSegment(artifact.selection)}`;
  if (artifact.kind === "spectrogram_segment")
    return `Explaining: Spectrogram for ${describeDiarizationSegment(artifact.selection)}`;
  if (artifact.selection?.scope === "result")
    return "Explaining: this classification result";
  if (artifact.kind === "classification_gradcam") {
    const view = artifact.selection?.view === "focus" ? "Focus Areas" : "Intensity Map";
    return `Explaining: ${view} for "${artifact.selection?.label || "the selected class"}"`;
  }
  return `Explaining: ${artifact.selection?.label || "the selected class"}`;
}

function getSuggestions(artifact) {
  if (artifact.kind === "text_selection") {
    return [
      "What does this mean in the context of this model result?",
      "Can you explain this in simpler terms?",
      "Why is this detail important here?"
    ];
  }
  if (artifact.kind === "token_decision") {
    return [
      "Why was this token selected here?",
      "What does this probability mean?",
      "What other tokens were plausible?",
      "How did the preceding text affect this choice?"
    ];
  }
  if (artifact.kind === "diarization_segment") {
    return [
      "What does this segment mean?",
      "What does the confidence value mean?",
      "Why is the audio divided into speaker segments?",
      "What can I conclude from this result?"
    ];
  }
  if (artifact.kind === "spectrogram_segment") {
    return [
      "What am I looking at?",
      "What do the colors and axes represent?",
      "What patterns are visible here?",
      "Does this spectrogram explain why the model chose this speaker?"
    ];
  }
  if (artifact.selection?.scope === "result") {
    return [
      "Summarize this result in plain language.",
      "How close were the leading predictions?",
      "What should I be cautious about when interpreting this result?"
    ];
  }
  if (artifact.kind === "classification_gradcam" && artifact.selection?.view === "focus") {
    return [
      "What do these highlighted focus areas mean?",
      "Why might these regions support this class?",
      "What are the limitations of this Focus Areas view?"
    ];
  }
  if (artifact.kind === "classification_gradcam") {
    return [
      "How should I read the colors in this intensity map?",
      "Where is the strongest positive influence for this class?",
      "What are the limitations of this intensity map?"
    ];
  }
  return [
    "How should I interpret this probability?",
    "Why did this class rank where it did?",
    "How does this prediction compare with the other top results?"
  ];
}

function shortenSelectedText(text) {
  if (text.length <= 100) return text;
  return `${text.slice(0, 97).trim()}...`;
}

function displayToken(token) {
  if (token === "\n") return "newline";
  if (token === "\t") return "tab";
  return token?.replace(/ /g, "·") || "empty";
}

function describeDiarizationSegment(selection = {}) {
  const speaker = selection.speaker || "speaker segment";
  if (!Number.isFinite(selection.startTime) || !Number.isFinite(selection.endTime))
    return speaker;
  return `${speaker} · ${formatDiarizationTime(selection.startTime)}–${formatDiarizationTime(selection.endTime)}`;
}

function formatDiarizationTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const hundredths = Math.floor((seconds % 1) * 100);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}.${hundredths.toString().padStart(2, "0")}`;
}
