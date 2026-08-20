import React from "react";
import "./EmptyState.css";

const EmptyState = ({
  icon = "bi bi-inbox",
  title = "No records found",
  description = "There is nothing to display yet.",
  actionLabel = "",
  onAction,
  variant = "default",
  className = "",
}) => (
  <div
    className={`app-empty-state app-empty-state--${variant} ${className}`.trim()}
    role="status"
  >
    <span className="app-empty-state__icon" aria-hidden="true">
      <i className={icon} />
    </span>
    <div className="app-empty-state__content">
      <strong>{title}</strong>
      {description && <p>{description}</p>}
    </div>
    {actionLabel && typeof onAction === "function" && (
      <button type="button" className="btn btn-outline-primary btn-sm" onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
