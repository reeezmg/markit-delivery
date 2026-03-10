import React from "react";
import "./WalkthroughStep.css";

interface Props {
  current: number;    // 1-indexed current step
  steps: string[];    // array of step names
  accentColor?: string; // defaults to #2563eb
}

const hexToRgb = (hex: string): string => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
};

const WalkthroughStep: React.FC<Props> = ({ current, steps, accentColor = "#2563eb" }) => {
  const total = steps.length;
  const progressPercent = ((current - 1) / Math.max(total - 1, 1)) * 100;
  const accentRgb = hexToRgb(accentColor);

  return (
    <div
      className="wt-wrapper"
      style={{ "--wt-accent": accentColor, "--wt-accent-rgb": accentRgb } as React.CSSProperties}
    >
      {/* Header row */}
      <div className="wt-header">
        <span className="wt-step-count">Step {current} of {total}</span>
        <span className="wt-step-name" style={{ color: accentColor }}>
          {steps[current - 1] ?? ""}
        </span>
      </div>

      {/* Progress bar */}
      <div className="wt-progress-bar-track">
        <div
          className="wt-progress-bar-fill"
          style={{ width: `${progressPercent}%`, background: accentColor }}
        />
      </div>

      {/* Dots row */}
      <div className="wt-dots-row">
        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const isDone = stepNum < current;
          const isActive = stepNum === current;
          const isPending = stepNum > current;

          return (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <div className={`wt-connector${isDone || stepNum <= current ? " done" : ""}`} />
              )}
              <div className="wt-dot-wrapper">
                <div
                  className={`wt-dot${isDone ? " done" : isActive ? " active" : " pending"}`}
                >
                  {isDone ? "✓" : stepNum}
                </div>
                <span className={`wt-dot-label${isActive ? " active" : ""}`}>
                  {label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default WalkthroughStep;
