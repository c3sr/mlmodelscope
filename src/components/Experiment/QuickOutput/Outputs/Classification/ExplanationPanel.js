import React, { useState } from "react";
import useBEMNaming from "../../../../../common/useBEMNaming";
import AIExplainAction from "../../InteractiveExplanation/AIExplainAction";
import "./ExplanationPanel.scss";

const formatPercent = (value) =>
  typeof value === "number" ? `${(value * 100).toFixed(1)}%` : "Unavailable";

const formatNumber = (value) =>
  typeof value === "number" ? value.toFixed(3) : "Unavailable";

const artifactSource = (artifact) =>
  artifact?.data
    ? `data:${artifact.mimeType || "image/png"};base64,${artifact.data}`
    : null;

const readableModelName = (name) =>
  name ? name.replace(/_/g, " ") : "PyTorch image classifier";

const defaultPreprocessOperations = [
  "Convert the uploaded image to RGB",
  "Resize the shorter side to 256 pixels",
  "Take the centered 224 by 224 crop",
  "Convert pixel values to a tensor",
  "Normalize each RGB channel using ImageNet statistics"
];

function ScoreRows({ classes, valueKey, formatter, getElement }) {
  const maximum = Math.max(...classes.map((item) => Math.abs(item[valueKey] || 0)), 1);
  return (
    <div className={getElement("score-list")}>
      {classes.map((item) => (
        <div className={getElement("score-row")} key={item.index}>
          <span title={item.label}>{item.label}</span>
          <div>
            <i style={{ width: `${Math.max(Math.abs(item[valueKey]) / maximum * 100, 4)}%` }} />
          </div>
          <strong>{formatter(item[valueKey])}</strong>
        </div>
      ))}
    </div>
  );
}

export default function ExplanationPanel({ explanation, onExplainEvidence }) {
  const { getBlock, getElement } = useBEMNaming("model-explanation");
  const [selectedRank, setSelectedRank] = useState(0);
  const [evidenceView, setEvidenceView] = useState("focus");

  if (!explanation)
    return null;

  if (explanation.status !== "complete") {
    const message = explanation.status === "unsupported"
      ? "This model or run configuration does not support Grad-CAM explanations."
      : "The prediction completed, but its explanation could not be generated.";
    return (
      <section className={getBlock()} aria-live="polite">
        <h3>Model explanation unavailable</h3>
        <p>{message}</p>
      </section>
    );
  }

  const classes = explanation.classes || [];
  const selectedClass = classes[selectedRank] || classes[0];
  if (!selectedClass)
    return null;

  const pipeline = explanation.pipeline || {};
  const preprocess = pipeline.preprocess || {};
  const inference = pipeline.inference || {};
  const postprocess = pipeline.postprocess || {};
  const pipelineClasses = inference.rawOutput?.classes || classes;
  const finalOutput = pipeline.finalOutput || classes[0];
  const comparison = explanation.comparison || {};
  const preprocessOperations = preprocess.operations?.length
    ? preprocess.operations
    : defaultPreprocessOperations;

  return (
    <section className={getBlock()} aria-labelledby="model-explanation-title">
      <header className={getElement("header")}>
        <div>
          <p className={getElement("eyebrow")}>Model explanation</p>
          <h3 id="model-explanation-title">From input image to prediction</h3>
          <p>
            Follow the values through preprocessing, model inference, and
            postprocessing. The evidence maps then show which model-input regions
            positively influenced each leading class.
          </p>
        </div>
        <span className={getElement("method")}>Grad-CAM</span>
      </header>

      <div className={getElement("pipeline")} aria-label="Image classification inference pipeline">
        <article className={getElement("stage")}>
          <div className={getElement("stage-heading")}>
            <span>1</span>
            <div>
              <p>Pre-process</p>
              <h4>Prepare pixels</h4>
            </div>
          </div>
          {artifactSource(preprocess.modelInput) && (
            <figure className={getElement("model-input")}>
              <img
                src={artifactSource(preprocess.modelInput)}
                alt="Exact center-cropped tensor passed to the model"
              />
              <figcaption>Exact model input: 224 × 224 RGB</figcaption>
            </figure>
          )}
          <p className={getElement("stage-summary")}>
            RGB → resize shorter side to 256 → center crop 224 → tensor → normalize
          </p>
          <dl className={getElement("tensor")}>
            <div><dt>Tensor shape</dt><dd>{preprocess.tensor?.shape?.join(" × ") || "1 × 3 × 224 × 224"}</dd></div>
            <div><dt>Data type</dt><dd>{preprocess.tensor?.dataType || "float32"}</dd></div>
          </dl>
          <section className={getElement("operations")} aria-labelledby="preprocess-operations-title">
            <h5 id="preprocess-operations-title">Preprocessing operations</h5>
            <ol>
              {preprocessOperations.map((operation) => (
                <li key={operation}>{operation}</li>
              ))}
            </ol>
          </section>
        </article>

        <article className={getElement("stage")}>
          <div className={getElement("stage-heading")}>
            <span>2</span>
            <div>
              <p>Inference</p>
              <h4>Compute raw scores</h4>
            </div>
          </div>
          <div className={getElement("model-chip")}>
            <span>PyTorch model</span>
            <strong>{readableModelName(inference.model)}</strong>
          </div>
          <p className={getElement("stage-summary")}>
            The network converts the tensor into one raw logit per class. Logits
            are relative scores, not probabilities.
          </p>
          <ScoreRows
            classes={pipelineClasses}
            valueKey="logit"
            formatter={formatNumber}
            getElement={getElement}
          />
          <dl className={getElement("tensor")}>
            <div><dt>Raw output</dt><dd>{inference.rawOutput?.shape?.join(" × ") || "1 × classes"}</dd></div>
            <div><dt>Explained layer</dt><dd>{inference.targetLayer || explanation.targetLayer}</dd></div>
          </dl>
        </article>

        <article className={getElement("stage")}>
          <div className={getElement("stage-heading")}>
            <span>3</span>
            <div>
              <p>Post-process</p>
              <h4>Convert and rank</h4>
            </div>
          </div>
          <div className={getElement("softmax")}>
            <strong>Softmax</strong>
            <span>logits → probabilities totaling 100%</span>
          </div>
          <ScoreRows
            classes={postprocess.classes || classes}
            valueKey="probability"
            formatter={formatPercent}
            getElement={getElement}
          />
          <div className={getElement("final-output")}>
            <span>Final prediction shown to the user</span>
            <strong>{finalOutput?.label}</strong>
            <b>{formatPercent(finalOutput?.probability)}</b>
          </div>
        </article>
      </div>

      <div className={getElement("evidence-heading")}>
        <div>
          <p className={getElement("eyebrow")}>Class evidence</p>
          <h4>Why did the leading scores differ?</h4>
        </div>
        <div>
          <p>
            These overlays use the exact preprocessed crop above, not the full
            uploaded image.
          </p>
        </div>
      </div>

      <div className={getElement("view-controls")}>
        <div role="group" aria-label="Evidence visualization">
          <button
            type="button"
            aria-pressed={evidenceView === "focus"}
            onClick={() => setEvidenceView("focus")}
          >
            Focus areas
          </button>
          <button
            type="button"
            aria-pressed={evidenceView === "intensity"}
            onClick={() => setEvidenceView("intensity")}
          >
            Intensity map
          </button>
        </div>
        <p>
          {evidenceView === "focus"
            ? "Recommended: full-color areas inside the cyan boundary are the strongest positive evidence. Everything else is intentionally darkened."
            : "Technical view: cyan indicates moderate positive influence; magenta and white indicate stronger influence."}
        </p>
      </div>

      {evidenceView === "intensity" && (
        <div className={getElement("evidence-legend")} aria-label="Evidence intensity legend">
          <div className={getElement("legend-scale")} aria-hidden="true" />
          <div className={getElement("legend-labels")}>
            <span>Little positive influence</span>
            <span>Moderate</span>
            <span>Strongest positive influence</span>
          </div>
        </div>
      )}

      <div className={getElement("evidence-board")} data-explanation-section="Class evidence">
        <div className={getElement("overlay-grid")} role="group" aria-label="Winner and runner-up evidence maps">
          {classes.slice(0, 2).map((classResult, index) => (
            <figure
              key={classResult.index}
              className={`${getElement("overlay-card")} ${
                selectedRank === index ? "model-explanation__overlay-card--selected" : ""
              }`}
            >
              <button
                type="button"
                aria-pressed={selectedRank === index}
                onClick={() => setSelectedRank(index)}
              >
                <span>Rank {classResult.rank}</span>
                <strong>{classResult.label}</strong>
              </button>
              <div className={getElement("evidence-image")}>
                <img
                  src={artifactSource(
                    evidenceView === "focus"
                      ? classResult.focusMask || classResult.overlay
                      : classResult.heatmap || classResult.overlay
                  )}
                  alt={`${evidenceView === "focus" ? "Focus areas" : "Evidence intensity"} for ${classResult.label}`}
                />
                <span>
                  {evidenceView === "focus" ? "Strongest evidence area" : "Positive influence intensity"}
                </span>
              </div>
              <figcaption>
                <div>
                  <strong>{formatPercent(classResult.probability)}</strong>
                  <span>Logit {formatNumber(classResult.logit)}</span>
                </div>
                {onExplainEvidence && (
                  <AIExplainAction
                    onClick={() => onExplainEvidence({ classResult, evidenceView })}
                    ariaLabel={`Explain this Grad-CAM ${evidenceView === "focus" ? "focus visualization" : "intensity map"} for ${classResult.label} with AI`}
                  />
                )}
              </figcaption>
            </figure>
          ))}
        </div>

        <aside className={getElement("interpretation")}>
          <p className={getElement("eyebrow")}>Selected map</p>
          <h5>{selectedClass.label}</h5>
          <p>
            {evidenceView === "focus"
              ? "Look first inside the cyan boundary. The preserved full-color region contains the strongest positive evidence for this class."
              : "Cyan-to-magenta regions made this class score more positive. Dark regions had little positive influence."}
          </p>
          <div className={getElement("margin-metrics")}>
            <div><span>Probability lead</span><strong>{formatPercent(comparison.probabilityMargin)}</strong></div>
            <div><span>Logit lead</span><strong>{formatNumber(comparison.logitMargin)}</strong></div>
          </div>
          <p className={getElement("caution")}>
            Influence is not proof of recognition, causality, or human-like attention.
          </p>
        </aside>
      </div>

      <div className={getElement("details")}>
        <article>
          <h5>How to read the maps</h5>
          <p>Start with Focus areas and compare the outlined regions for both classes. Use Intensity map only when you need the full Grad-CAM strength distribution.</p>
        </article>
        <article>
          <h5>How Grad-CAM works</h5>
          <p>Grad-CAM weights final convolution activations using gradients for the selected class score.</p>
        </article>
        <article>
          <h5>Limitations</h5>
          {(explanation.limitations || []).map((limitation) => <p key={limitation}>{limitation}</p>)}
        </article>
      </div>
    </section>
  );
}
