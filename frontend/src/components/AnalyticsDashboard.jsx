
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const API_URL = "http://127.0.0.1:8000";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [riskLevel, setRiskLevel] = useState("");

  // Fetch analytics from backend
  const fetchAnalytics = async (filters = {}) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (filters.date_from) {
        params.append("date_from", filters.date_from);
      }

      if (filters.date_to) {
        params.append("date_to", filters.date_to);
      }

      if (filters.risk_level) {
        params.append("risk_level", filters.risk_level);
      }

      const query = params.toString();

      const response = await fetch(
        `${API_URL}/analytics/dashboard${query ? `?${query}` : ""}`
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message || "Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Apply filters
  const handleApplyFilters = () => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setError("Start date cannot be after end date.");
      return;
    }

    fetchAnalytics({
      date_from: dateFrom,
      date_to: dateTo,
      risk_level: riskLevel,
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setRiskLevel("");
    fetchAnalytics();
  };

  if (loading && !analytics) {
    return <div className="analytics-dashboard">Loading analytics...</div>;
  }

  if (error && !analytics) {
    return (
      <div className="analytics-dashboard">
        <p className="error-message">{error}</p>
        <button onClick={() => fetchAnalytics()}>Retry</button>
      </div>
    );
  }

  if (!analytics) return null;

  const overview = analytics.overview;

  const riskData = ["Low", "Medium", "High"].map((level) => ({
    name: level,
    value:
      analytics.risk_distribution.find(
        (item) => item.risk_level === level
      )?.count || 0,
  }));

  const statusData = analytics.status_distribution.map((item) => ({
    name: item.status,
    applications: item.count,
  }));

  return (
    <div className="analytics-dashboard">

      {/* Header */}
      <div className="analytics-header">
        <div>
          <h1>Risk Analytics Dashboard</h1>
          <p>Monitor loan applications and credit risk performance.</p>
        </div>

        <button onClick={() => fetchAnalytics({
          date_from: dateFrom,
          date_to: dateTo,
          risk_level: riskLevel,
        })}>
          Refresh Data
        </button>
      </div>

      {/* Filters */}
      <div className="analytics-filters">
        <div className="filter-group">
          <label htmlFor="dateFrom">Start Date</label>
          <input
            id="dateFrom"
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="dateTo">End Date</label>
          <input
            id="dateTo"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="riskLevel">Risk Level</label>
          <select
            id="riskLevel"
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
          >
            <option value="">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>

        <div className="filter-actions">
          <button
            className="apply-filter-btn"
            onClick={handleApplyFilters}
            disabled={loading}
          >
            Apply Filters
          </button>

          <button
            className="reset-filter-btn"
            onClick={handleResetFilters}
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      {loading && <p>Updating analytics...</p>}

      {/* KPI Cards */}
      <div className="analytics-cards">
        <div className="analytics-card">
          <h3>Total Applications</h3>
          <h2>{overview.total_applications}</h2>
        </div>

        <div className="analytics-card">
          <h3>Pending Reviews</h3>
          <h2>{overview.pending_reviews}</h2>
        </div>

        <div className="analytics-card">
          <h3>Approved</h3>
          <h2>{overview.approved_applications}</h2>
        </div>

        <div className="analytics-card">
          <h3>Rejected</h3>
          <h2>{overview.rejected_applications}</h2>
        </div>

        <div className="analytics-card">
          <h3>Average Default Probability</h3>
          <h2>{overview.average_default_probability}%</h2>
        </div>
      </div>

      {/* Charts */}
      <div className="analytics-charts">

        {/* Risk Distribution */}
        <div className="analytics-chart-card">
          <h3>Risk Distribution</h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                label
              >
                {riskData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Application Status */}
        <div className="analytics-chart-card">
          <h3>Application Status</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="applications"
                fill="#6366f1"
                name="Applications"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Application Trend */}
        <div className="analytics-chart-card analytics-trend-card">
          <h3>Application Trend</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.application_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#0ea5e9"
                strokeWidth={3}
                name="Applications"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

export default AnalyticsDashboard;
