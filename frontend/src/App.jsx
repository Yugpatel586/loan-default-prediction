
import { useEffect, useState } from "react";
import ApplicationForm from "./components/ApplicationForm";
import PredictionResult from "./components/PredictionResult";
import RiskAnalytics from "./components/RiskAnalytics";
import ApplicationManagement from "./components/ApplicationManagement";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Close sidebar on page change (mobile)
  const navigateTo = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

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

  const lowRiskCount = history.filter(
    (item) => item.riskLevel === "Low"
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

  // Inline SVG icons
  const icons = {
    dashboard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),

    prediction: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
    ),

    applications: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),

    analytics: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-5 5" />
      </svg>
    ),

    total: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),

    highRisk: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),

    lowRisk: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),

    percent: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="5" x2="5" y2="19" />
        <circle cx="6.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    ),

    download: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),

    plus: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),

    menu: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
      </svg>
    ),

    close: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),

    shield: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),

    empty: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M9 15h6" />
      </svg>
    ),
  };

  return (
    <div className="dashboard">

      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? icons.close : icons.menu}
      </button>

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <h2>
            <span className="brand-icon">{icons.shield}</span>
            CreditRisk AI
          </h2>
          <p>Loan Prediction System</p>
        </div>

        <nav className="sidebar-nav">

          <button
            className={activePage === "overview" ? "active" : ""}
            onClick={() => navigateTo("overview")}
          >
            {icons.dashboard}
            Dashboard
          </button>

          <button
            className={activePage === "prediction" ? "active" : ""}
            onClick={() => navigateTo("prediction")}
          >
            {icons.prediction}
            New Prediction
          </button>

          <button
            className={activePage === "applications" ? "active" : ""}
            onClick={() => navigateTo("applications")}
          >
            {icons.applications}
            Loan Applications
          </button>

          <button
            className={activePage === "analytics" ? "active" : ""}
            onClick={() => navigateTo("analytics")}
          >
            {icons.analytics}
            Risk Analytics
          </button>

        </nav>

        <div className="sidebar-profile">
          <div className="sidebar-avatar">A</div>
          <div className="sidebar-profile-info">
            <p>Analyst</p>
            <span>Credit Risk Dept.</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* Dashboard Overview */}
        {activePage === "overview" && (
          <section>

            <div className="welcome-banner">
              <h2>Welcome to CreditRisk AI Dashboard</h2>
              <p>
                Monitor loan default predictions, analyze risk
                distributions, and make data-driven credit decisions
                with machine learning.
              </p>

              <div className="welcome-banner-actions">
                <button
                  className="welcome-btn welcome-btn-primary"
                  onClick={() => navigateTo("prediction")}
                >
                  {icons.plus}
                  New Prediction
                </button>

                <button
                  className="welcome-btn welcome-btn-secondary"
                  onClick={exportToCSV}
                >
                  {icons.download}
                  Export Report
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="stats-grid">

              <div className="stat-card">
                <div className="stat-card-header">
                  <p>Total Predictions</p>
                  <div className="stat-icon blue">{icons.total}</div>
                </div>
                <h2>{totalPredictions}</h2>
                <span className="stat-subtitle">
                  All time analyses
                </span>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <p>High Risk</p>
                  <div className="stat-icon red">{icons.highRisk}</div>
                </div>
                <h2>{highRiskCount}</h2>
                <span className="stat-subtitle">
                  {totalPredictions > 0
                    ? `${((highRiskCount / totalPredictions) * 100).toFixed(1)}% of total`
                    : "No data yet"}
                </span>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <p>Low Risk</p>
                  <div className="stat-icon green">{icons.lowRisk}</div>
                </div>
                <h2>{lowRiskCount}</h2>
                <span className="stat-subtitle">
                  {totalPredictions > 0
                    ? `${((lowRiskCount / totalPredictions) * 100).toFixed(1)}% of total`
                    : "No data yet"}
                </span>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <p>Avg. Default Probability</p>
                  <div className="stat-icon amber">{icons.percent}</div>
                </div>
                <h2>{averageProbability}%</h2>
                <span className="stat-subtitle">
                  Across all predictions
                </span>
              </div>

            </div>

            {/* Risk Analytics */}
            <RiskAnalytics history={history} />

            {/* Recent Predictions */}
            <div className="table-section">
              <div className="history-header">
                <h2>Recent Predictions</h2>

                <button
                  className="export-btn"
                  onClick={exportToCSV}
                >
                  {icons.download}
                  Export CSV
                </button>
              </div>

              {history.length === 0 ? (
                <div className="empty-message">
                  {icons.empty}
                  <p>
                    No predictions yet. Create a new prediction
                    to see your results here.
                  </p>
                </div>
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

        {/* New Prediction Page */}
        {activePage === "prediction" && (
          <section>
            <div className="page-header">
              <h1>New Loan Prediction</h1>
              <p>
                Enter applicant details to estimate default probability
                and risk level.
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

        {/* Loan Applications Page */}
        {activePage === "applications" && (
          <ApplicationManagement />
        )}


        {/* Risk Analytics Page */}
        {activePage === "analytics" && (
          <AnalyticsDashboard />
        )}

      </main>
    </div>
  );
}

export default App;
