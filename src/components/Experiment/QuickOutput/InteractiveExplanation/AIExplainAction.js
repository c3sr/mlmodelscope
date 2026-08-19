import React, { forwardRef } from "react";
import "./AIExplainAction.scss";

const AIExplainAction = forwardRef(function AIExplainAction({
  onClick,
  ariaLabel,
  className = "",
  ...buttonProps
}, ref) {
  return (
    <button
      {...buttonProps}
      ref={ref}
      type="button"
      className={`ai-explain-action ${className}`.trim()}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <span aria-hidden="true">✨</span> Explain
    </button>
  );
});

export default AIExplainAction;
