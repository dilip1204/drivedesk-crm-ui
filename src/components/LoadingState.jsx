import React from "react";
import "./LoadingState.css";

const LoadingState = ({
  label = "Loading data",
  description = "",
  variant = "default",
  className = "",
}) => (
  <div
    className={`app-loading-state app-loading-state--${variant} ${className}`.trim()}
    role="status"
    aria-live="polite"
    aria-label={label}
  >
    <span className="app-loading-state__spinner" aria-hidden="true" />
    <span className="app-loading-state__content">
      <strong>{label}</strong>
      {description && <small>{description}</small>}
    </span>
  </div>
);

export default LoadingState;
