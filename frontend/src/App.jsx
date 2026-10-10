
import { useEffect, useState } from "react";
import ApplicationForm from "./components/ApplicationForm";
import PredictionResult from "./components/PredictionResult";
import RiskAnalytics from "./components/RiskAnalytics";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("overview");

  // Load saved prediction history
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("predictionHistory");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Save prediction history
  useEffect(() => {
    try {
      localStorage.setItem(
        "predictionHistory",
        JSON.stringify(history)
      );
    } catch (err) {
      console.error("Could not save prediction history:", err);
    }
  }, [history]);

  // Submit applicant details to FastAPI
  const handlePrediction = async (formData) => {
    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          `Prediction failed (${response.status}): ${message}`
        );
      }

      const result = await response.json();

      setPrediction(result);

      const rawProbability =
        result.default_probability ??
        result.probability ??
        0;

      // The current FastAPI returns probability as a percentage.
      const probability = Number(rawProbability);

      const newRecord = {
        id: `${Date.now()}-${Math.random()}`,
        date: new Date().toLocaleString(),
        probability: Number.isFinite(probability)
          ? probability
          : 0,
        riskLevel:
          result.risk_level ??
          result.riskLevel ??
          "Unknown",
        prediction:
          result.prediction === 1 ||
          result.predicted_class === 1
            ? "Likely to Default"
            : result.prediction === 0 ||
                result.predicted_class === 0
              ? "Unlikely to Default"
              : String(
                  result.prediction ??
                  result.predicted_class ??
                  "Unknown"
                ),
      };

      setHistory((previous) => [newRecord, ...previous]);
    } catch (err) {
      setError(
        err.message || "Unable to connect to the prediction server."
      );
    } finally {
      setLoading(false);
    }
  };

  // Dashboard statistics
  const totalPredictions = history.length;

  const highRiskCount = history.filter(
    (item) => item.riskLevel === "High"
  ).length;

  const averageProbability =
    totalPredictions > 0
      ? (
          history.reduce(
            (sum, item) =>
              sum + (Number(item.probability) || 0),
            0
          ) / totalPredictions
        ).toFixed(2)
      : "0.00";

  // Export history as CSV
  const exportToCSV = () => {
    if (history.length === 0) {
      alert("No prediction history to export.");
      return;
    }

    const headers = [
      "Date",
      "Prediction",
      "Default Probability (%)",
      "Risk Level",
    ];

    const rows = history.map((item) => [
      item.date,
      item.prediction,
      item.probability,
      item.riskLevel,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "loan_prediction_history.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>CreditRisk AI</h2>
          <p>Loan Prediction System</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activePage === "overview" ? "active" : ""}
            onClick={() => setActivePage("overview")}
          >
            Overview
          </button>

          <button
            className={activePage === "prediction" ? "active" : ""}
            onClick={() => setActivePage("prediction")}
          >
            New Prediction
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {activePage === "overview" && (
          <section>
            <div className="page-header">
              <h1>Dashboard Overview</h1>
              <p>
                Monitor loan default predictions and risk analytics.
              </p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <p>Total Predictions</p>
                <h2>{totalPredictions}</h2>
              </div>

              <div className="stat-card">
                <p>High-Risk Applicants</p>
                <h2>{highRiskCount}</h2>
              </div>

              <div className="stat-card">
                <p>Average Default Probability</p>
                <h2>{averageProbability}%</h2>
              </div>
            </div>

            {/* Risk distribution pie chart and prediction bar chart */}
            <RiskAnalytics history={history} />

            <div className="table-section">
              <div className="history-header">
                <h2>Recent Predictions</h2>

                <button
                  className="export-btn"
                  onClick={exportToCSV}
                >
                  Export CSV
                </button>
              </div>

              {history.length === 0 ? (
                <p className="empty-message">
                  No predictions yet. Create a new prediction
                  to see your results here.
                </p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Prediction</th>
                        <th>Default Probability</th>
                        <th>Risk Level</th>
                      </tr>
                    </thead>

                    <tbody>
                      {history.slice(0, 10).map((item) => (
                        <tr key={item.id}>
                          <td>{item.date}</td>
                          <td>{item.prediction}</td>
                          <td>
                            {Number(item.probability).toFixed(2)}%
                          </td>
                          <td>
                            <span
                              className={`risk-badge ${String(
                                item.riskLevel
                              ).toLowerCase()}`}
                            >
                              {item.riskLevel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {activePage === "prediction" && (
          <section>
            <div className="page-header">
              <h1>New Loan Prediction</h1>
              <p>
                Enter applicant details to estimate default probability.
              </p>
            </div>

            <ApplicationForm
              onSubmit={handlePrediction}
              loading={loading}
            />

            {error && (
              <p className="error-message">{error}</p>
            )}

            {prediction && (
              <PredictionResult result={prediction} />
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
