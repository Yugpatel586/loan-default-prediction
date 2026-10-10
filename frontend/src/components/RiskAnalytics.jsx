
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
} from "recharts";
import "./RiskAnalytics.css";

function RiskAnalytics({ history = [] }) {
  const colors = {
    High: "#ef4444",
    Medium: "#f59e0b",
    Low: "#22c55e",
  };

  // Count applicants by risk level
  const riskCounts = {
    Low: 0,
    Medium: 0,
    High: 0,
  };

  history.forEach((item) => {
    const risk = String(item.riskLevel || "").toLowerCase();

    if (risk === "low") riskCounts.Low++;
    if (risk === "medium") riskCounts.Medium++;
    if (risk === "high") riskCounts.High++;
  });

  const riskData = Object.entries(riskCounts)
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0);

  // Count predictions, supporting numeric API outputs (0 and 1)
  const predictionData = [
    {
      name: "Unlikely to Default",
      count: history.filter((item) => {
        const value = item.prediction;
        return (
          value === 0 ||
          String(value).toLowerCase().includes("unlikely") ||
          String(value).toLowerCase().includes("non-default")
        );
      }).length,
    },
    {
      name: "Likely to Default",
      count: history.filter((item) => {
        const value = item.prediction;
        return (
          value === 1 ||
          String(value).toLowerCase().includes("likely") &&
            !String(value).toLowerCase().includes("unlikely")
        );
      }).length,
    },
  ];

  return (
    <section className="analytics-section">
      <div className="analytics-heading">
        <h2>Risk Analytics</h2>
        <p>Summary of saved loan predictions</p>
      </div>

      <div className="charts-grid">
        {/* Risk Pie Chart */}
        <div className="chart-card">
          <h3>Risk Distribution</h3>

          {riskData.length === 0 ? (
            <div className="chart-empty">
              <p>No risk data available yet.</p>
              <p>Submit a prediction to populate this chart.</p>
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {riskData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={colors[entry.name]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Prediction Bar Chart */}
        <div className="chart-card">
          <h3>Prediction Distribution</h3>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={predictionData}
                margin={{
                  top: 15,
                  right: 15,
                  left: 0,
                  bottom: 35,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                  tick={{ fontSize: 10 }}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Applicants"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RiskAnalytics;
