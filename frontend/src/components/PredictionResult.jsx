
function PredictionResult({ result }) {
  if (!result) return null;

  const riskConfig = {
    Low: {
      color: "var(--color-success)",
      bg: "var(--color-success-bg)",
      border: "rgba(22, 163, 74, 0.15)",
      label: "Low Risk",
    },
    Medium: {
      color: "var(--color-warning)",
      bg: "var(--color-warning-bg)",
      border: "rgba(217, 119, 6, 0.15)",
      label: "Medium Risk",
    },
    High: {
      color: "var(--color-danger)",
      bg: "var(--color-danger-bg)",
      border: "rgba(220, 38, 38, 0.15)",
      label: "High Risk",
    },
  };

  const risk = riskConfig[result.risk_level] || {
    color: "#64748b",
    bg: "#f1f5f9",
    border: "#e2e8f0",
    label: `${result.risk_level || "Unknown"} Risk`,
  };

  const riskClass = String(result.risk_level || "").toLowerCase();

  return (
    <div className="result-card">
      <div className="result-card-header">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Prediction Result
        </h2>
      </div>

      <div className="result-body">
        <div className="risk-summary">
          <div>
            <p className="result-label">Predicted Outcome</p>
            <h3>
              {result.prediction === 1
                ? "Likely to Default"
                : "Unlikely to Default"}
            </h3>
          </div>

          <div className={`result-risk-badge ${riskClass}`}>
            {risk.label}
          </div>
        </div>

        <div className="probability-section">
          <div className="probability-heading">
            <span>Default Probability</span>
            <strong style={{ color: risk.color }}>
              {result.default_probability}%
            </strong>
          </div>

          <div className="probability-track">
            <div
              className="probability-fill"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, result.default_probability)
                )}%`,
                backgroundColor: risk.color,
              }}
            />
          </div>
        </div>

        <p className="result-note">
          This is a model-generated estimate and should not be
          treated as a final lending decision.
        </p>
      </div>
    </div>
  );
}

export default PredictionResult;
