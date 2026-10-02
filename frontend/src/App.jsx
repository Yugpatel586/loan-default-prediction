
import { useState } from "react";
import ApplicationForm from "./components/ApplicationForm";
import PredictionResult from "./components/PredictionResult";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("overview");
  const [history, setHistory] = useState([]);

  const handleSubmit = async (applicant) => {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicant),
      });

      if (!response.ok) {
        throw new Error("Prediction request failed. Check the entered data.");
      }

      const data = await response.json();
      setResult(data);

      setHistory((prev) => [
        {
          id: Date.now(),
          age: applicant.Age,
          income: applicant.Income,
          probability: data.default_probability,
          risk: data.risk_level,
          prediction: data.prediction,
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  const highRiskCount = history.filter(
    (item) => item.risk === "High"
  ).length;

  const averageProbability =
    history.length > 0
      ? (
          history.reduce((sum, item) => sum + item.probability, 0) /
          history.length
        ).toFixed(2)
      : "0.00";

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2 className="brand">LoanRisk AI</h2>

        <nav>
          <button
            className={activePage === "overview" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("overview")}
          >
            Overview
          </button>

          <button
            className={activePage === "prediction" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("prediction")}
          >
            New Prediction
          </button>
        </nav>

        <div className="sidebar-footer">
          Smart Loan Default Prediction
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>
              {activePage === "overview"
                ? "Dashboard Overview"
                : "New Loan Prediction"}
            </h1>
            <p>AI-powered credit risk assessment</p>
          </div>
        </header>

        {activePage === "overview" ? (
          <section>
            <div className="stats-grid">
              <div className="stat-card">
                <p>Total Predictions</p>
                <h2>{history.length}</h2>
              </div>

              <div className="stat-card">
                <p>High-Risk Cases</p>
                <h2>{highRiskCount}</h2>
              </div>

              <div className="stat-card">
                <p>Average Default Probability</p>
                <h2>{averageProbability}%</h2>
              </div>
            </div>

            <div className="history-card">
              <h2>Recent Predictions</h2>

              {history.length === 0 ? (
                <p className="empty-state">
                  No predictions yet. Start by analyzing an applicant.
                </p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Age</th>
                        <th>Income</th>
                        <th>Prediction</th>
                        <th>Probability</th>
                        <th>Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={item.id}>
                          <td>{item.age}</td>
                          <td>{item.income.toLocaleString("en-IN")}</td>
                          <td>
                            {item.prediction === 1
                              ? "Likely to Default"
                              : "Unlikely to Default"}
                          </td>
                          <td>{item.probability}%</td>
                          <td>{item.risk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <button
              className="primary-button"
              onClick={() => setActivePage("prediction")}
            >
              Analyze New Applicant
            </button>
          </section>
        ) : (
          <section>
            <ApplicationForm
              onSubmit={handleSubmit}
              loading={loading}
            />

            {error && (
              <div className="result-card error">
                <h2>Error</h2>
                <p>{error}</p>
              </div>
            )}

            {result && <PredictionResult result={result} />}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
