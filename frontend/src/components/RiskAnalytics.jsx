
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

const RISK_COLORS = {
  High: "#dc2626",
  Medium: "#d97706",
  Low: "#16a34a",
};

const BAR_COLORS = ["#2563eb", "#dc2626"];

function CustomTooltipPie({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="chart-tooltip">
        <span className="chart-tooltip-dot" style={{ background: data.payload.fill || RISK_COLORS[data.name] }} />
        <span className="chart-tooltip-label">{data.name}</span>
        <strong className="chart-tooltip-value">{data.value}</strong>
      </div>
    );
  }
  return null;
}

function CustomTooltipBar({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <span className="chart-tooltip-label">{label}</span>
        <strong className="chart-tooltip-value">{payload[0].value} applicants</strong>
      </div>
    );
  }
  return null;
}

function ChartLegend({ payload }) {
  return (
    <div className="chart-legend">
      {(payload || []).map((entry) => (
        <div key={entry.value} className="chart-legend-item">
          <span className="chart-legend-dot" style={{ background: entry.color }} />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function RiskAnalytics({ history = [] }) {
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
      <div className="charts-grid">
        {/* Risk Donut Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Risk Distribution</h3>
            <span className="chart-card-badge">{history.length} total</span>
          </div>

          {riskData.length === 0 ? (
            <div className="chart-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
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
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    cornerRadius={4}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {riskData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={RISK_COLORS[entry.name]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipPie />} />
                  <Legend content={<ChartLegend />} verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Prediction Bar Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Prediction Distribution</h3>
            <span className="chart-card-badge">Binary outcome</span>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={predictionData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 0,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltipBar />} />
                <Bar
                  dataKey="count"
                  name="Applicants"
                  radius={[6, 6, 0, 0]}
                  barSize={48}
                >
                  {predictionData.map((entry, index) => (
                    <Cell key={entry.name} fill={BAR_COLORS[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RiskAnalytics;
