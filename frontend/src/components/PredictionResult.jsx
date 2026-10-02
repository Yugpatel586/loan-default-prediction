
function PredictionResult({ result }) {
  if (!result) return null;

  const riskColors = {
    Low: "#16a34a",
    Medium: "#f59e0b",
    High: "#dc2626",
  };

  const riskColor = riskColors[result.risk_level] || "#64748b";

  return (
    <div className="result-card">
      <h2>Prediction Result</h2>

      <div className="risk-summary">
        <div>
          <p className="result-label">Predicted outcome</p>
          <h3>
            {result.prediction === 1
              ? "Likely to Default"
              : "Unlikely to Default"}
          </h3>
        </div>

        <div
          className="risk-badge"
          style={{
            backgroundColor: `${riskColor}20`,
            color: riskColor,
          }}
        >
          {result.risk_level} Risk
        </div>
      </div>

      <div className="probability-section">
        <div className="probability-heading">
          <span>Default Probability</span>
          <strong>{result.default_probability}%</strong>
        </div>

        <div className="probability-track">
          <div
            className="probability-fill"
            style={{
              width: `${Math.min(
                100,
                Math.max(0, result.default_probability)
              )}%`,
              backgroundColor: riskColor,
            }}
          />
        </div>
      </div>

      <p className="result-note">
        This is a model-generated estimate and should not be
        treated as a final lending decision.
      </p>
    </div>
  );
}

export default PredictionResult;
