import React from "react";
import useBEMNaming from "../../../../../common/useBEMNaming";
import AIExplainAction from "../../InteractiveExplanation/AIExplainAction";
import "./TextExplanationPanel.scss";

const formatPercent = (value) =>
  typeof value === "number" ? `${(value * 100).toFixed(1)}%` : "Unavailable";

const formatToken = (token) => {
  if (token === "\n") return "↵ newline";
  if (token === "\t") return "⇥ tab";
  return token?.replace(/ /g, "·") || "empty";
};

function TokenBar({ token, getElement, onExplainToken }) {
  const width = Math.max((token.probability || 0) * 100, 3);
  const alternatives = token.alternatives || [];
  const topAlternative = alternatives[0];

  return (
    <article className={getElement("token-row")}>
      <div className={getElement("token-main")}>
        <span>#{token.position + 1}</span>
        <strong title={token.token}>{formatToken(token.token)}</strong>
      </div>
      <div className={getElement("probability")}>
        <div aria-hidden="true">
          <i style={{ width: `${width}%` }} />
        </div>
        <strong>{formatPercent(token.probability)}</strong>
      </div>
      <div className={getElement("token-detail")}>
        <span>Rank {token.rank}</span>
        {topAlternative && (
          <span>
            Top choice: <b>{formatToken(topAlternative.token)}</b> ({formatPercent(topAlternative.probability)})
          </span>
        )}
      </div>
      <div className={getElement("token-actions")}>
        <details className={getElement("alternatives")}>
          <summary>Show top alternatives</summary>
          <ol>
            {alternatives.map((alternative) => (
              <li key={`${token.position}-${alternative.id}`}>
                <span>{formatToken(alternative.token)}</span>
                <b>{formatPercent(alternative.probability)}</b>
              </li>
            ))}
          </ol>
        </details>
        {onExplainToken && (
          <AIExplainAction
            className={getElement("token-explain")}
            onClick={() => onExplainToken(token)}
            ariaLabel={`Explain token ${formatToken(token.token)} at generation step ${token.position + 1} with AI`}
          />
        )}
      </div>
    </article>
  );
}

export default function TextExplanationPanel({ explanation, onExplainToken }) {
  const { getBlock, getElement } = useBEMNaming("text-generation-explanation");

  if (!explanation) return null;

  if (explanation.status !== "complete") {
    const message = explanation.status === "unsupported"
      ? "This model or run configuration does not support token probability explanations."
      : "The text was generated, but its explanation could not be generated.";
    return (
      <section className={getBlock()} aria-live="polite">
        <h3>Generation explanation unavailable</h3>
        <p>{message}</p>
      </section>
    );
  }

  const pipeline = explanation.pipeline || {};
  const preprocess = pipeline.preprocess || {};
  const inference = pipeline.inference || {};
  const postprocess = pipeline.postprocess || {};
  const tokens = explanation.tokens || [];
  const summary = explanation.summary || {};
  const modelName = (inference.model || explanation.model || "the model")
    .replace(/_/g, " ")
    .replace(/\bbloom 560m\b/i, "BLOOM-560M")
    .replace(/\bgpt 2\b/i, "GPT-2");

  return (
    <section className={getBlock()} aria-labelledby="text-generation-explanation-title">
      <header className={getElement("header")}>
        <div>
          <p className={getElement("eyebrow")}>Model explanation</p>
          <h3 id="text-generation-explanation-title">From prompt to generated text</h3>
          <p>
            {modelName} generates text one token at a time. Each row below shows the
            selected token, its probability at that step, and the strongest
            alternatives the model considered.
          </p>
        </div>
        <span className={getElement("method")}>Token probabilities</span>
      </header>

      <div className={getElement("pipeline")} aria-label="Text generation inference pipeline">
        <article>
          <span>1</span>
          <p>Pre-process</p>
          <h4>Prompt to tokens</h4>
          <p>{(preprocess.operations || []).join(" → ")}</p>
          <dl>
            <div><dt>Tokenizer</dt><dd>{preprocess.tokenizer || "Unavailable"}</dd></div>
            <div><dt>Prompt tokens</dt><dd>{preprocess.tokens?.length || 0}</dd></div>
            <div><dt>Vocabulary</dt><dd>{preprocess.tensor?.vocabularySize?.toLocaleString() || "Unavailable"}</dd></div>
          </dl>
          <div className={getElement("prompt-tokens")}>
            {(preprocess.tokens || []).slice(0, 24).map((token) => (
              <code key={`${token.position}-${token.id}`}>{formatToken(token.token)}</code>
            ))}
          </div>
        </article>

        <article>
          <span>2</span>
          <p>Inference</p>
          <h4>Predict next token</h4>
          <p>{inference.description}</p>
          <dl>
            <div><dt>Model</dt><dd>{modelName}</dd></div>
            <div><dt>Generated tokens</dt><dd>{summary.generatedTokenCount || tokens.length}</dd></div>
            <div><dt>Average selected probability</dt><dd>{formatPercent(summary.averageSelectedTokenProbability)}</dd></div>
          </dl>
        </article>

        <article>
          <span>3</span>
          <p>Post-process</p>
          <h4>Tokens to text</h4>
          <p>{(postprocess.operations || []).join(" → ")}</p>
          <div className={getElement("final-text")}>
            <span>Final generated text</span>
            <strong>{postprocess.generatedText}</strong>
          </div>
        </article>
      </div>

      <div className={getElement("guide")}>
        <strong>How to read this</strong>
        <p>
          Higher probability means {modelName} strongly expected that token from the
          current context. Low probability marks a more uncertain or surprising
          token choice. These probabilities do not measure truthfulness.
        </p>
      </div>

      <div className={getElement("tokens")}>
        {tokens.map((token) => (
          <TokenBar
            key={`${token.position}-${token.id}`}
            token={token}
            getElement={getElement}
            onExplainToken={onExplainToken}
          />
        ))}
      </div>

      <div className={getElement("limitations")}>
        <h4>Limitations</h4>
        {(explanation.limitations || []).map((limitation) => (
          <p key={limitation}>{limitation}</p>
        ))}
      </div>
    </section>
  );
}
