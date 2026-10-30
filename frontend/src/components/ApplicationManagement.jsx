
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function ApplicationManagement() {
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);

  const [riskFilter, setRiskFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [officer, setOfficer] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchApplications = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (riskFilter) params.append("risk_level", riskFilter);
      if (statusFilter) params.append("review_status", statusFilter);

      const response = await fetch(
        `${API}/applications?${params.toString()}`
      );

      if (!response.ok) throw new Error("Unable to load applications.");

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async (caseId) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const [detailsResponse, historyResponse] = await Promise.all([
        fetch(`${API}/applications/${caseId}`),
        fetch(`${API}/applications/${caseId}/history`),
      ]);

      if (!detailsResponse.ok) {
        throw new Error("Unable to load application details.");
      }

      if (!historyResponse.ok) {
        throw new Error("Unable to load application history.");
      }

      const details = await detailsResponse.json();
      const historyData = await historyResponse.json();

      setSelected(details);
      setHistory(historyData.history || []);
      setStatus(details.review_status);
      setOfficer(details.assigned_officer_id || "");
      setNotes(details.review_notes || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshDetails = async () => {
    if (selected) {
      await openDetails(selected.case_id);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [riskFilter, statusFilter]);

  const updateStatus = async () => {
    if (!selected) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API}/applications/${selected.case_id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            changed_by: "Analyst",
            review_notes: notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Status update failed.");
      }

      setMessage("Review status and notes updated successfully.");
      await openDetails(selected.case_id);
      await fetchApplications();
    } catch (err) {
      setError(err.message);
    }
  };

  const assignOfficer = async () => {
    if (!selected) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API}/applications/${selected.case_id}/assignment`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            officer_id: officer.trim() || null,
            changed_by: "Analyst",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Officer assignment failed.");
      }

      setMessage("Officer assignment updated successfully.");
      await openDetails(selected.case_id);
      await fetchApplications();
    } catch (err) {
      setError(err.message);
    }
  };

  const goBack = () => {
    setSelected(null);
    setHistory([]);
    setError("");
    setMessage("");
  };

  const riskClass = (risk) =>
    String(risk || "").toLowerCase();

  return (
    <section className="application-management">

      {!selected ? (
        <>
          <div className="page-header">
            <h1>Loan Applications</h1>
            <p>Review and manage submitted loan applications.</p>
          </div>

          <div className="application-toolbar">
            <div className="application-filters">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="">All Risk Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <button
                className="application-button secondary"
                onClick={fetchApplications}
              >
                Refresh
              </button>
            </div>

            <span className="application-count">
              {applications.length} applications
            </span>
          </div>

          {error && <p className="error-message">{error}</p>}

          {loading ? (
            <p>Loading applications...</p>
          ) : (
            <div className="table-section">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Case ID</th>
                      <th>Applicant Ref.</th>
                      <th>Default Probability</th>
                      <th>Risk</th>
                      <th>Status</th>
                      <th>Assigned Officer</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.case_id}>
                        <td>{app.case_id}</td>
                        <td>{app.applicant_reference}</td>
                        <td>{app.default_probability}%</td>
                        <td>
                          <span className={`risk-badge ${riskClass(app.risk_level)}`}>
                            {app.risk_level}
                          </span>
                        </td>
                        <td>
                          <span className="application-status">
                            {app.review_status}
                          </span>
                        </td>
                        <td>
                          {app.assigned_officer_id || "Unassigned"}
                        </td>
                        <td>
                          <button
                            className="application-button"
                            onClick={() => openDetails(app.case_id)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}

                    {applications.length === 0 && (
                      <tr>
                        <td colSpan="7" className="empty-table">
                          No applications found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="application-detail-header">
            <div>
              <button className="back-button" onClick={goBack}>
                ← Back to Applications
              </button>
              <h1>Application Details</h1>
              <p>Case ID: {selected.case_id}</p>
            </div>

            <span className={`risk-badge ${riskClass(selected.risk_level)}`}>
              {selected.risk_level} Risk
            </span>
          </div>

          {error && <p className="error-message">{error}</p>}
          {message && <p className="application-success">{message}</p>}

          <div className="application-detail-grid">

            <div className="application-card">
              <h2>Applicant Information</h2>

              <div className="detail-grid">
                <div><span>Applicant Reference</span><strong>{selected.applicant_reference}</strong></div>
                {Object.entries(selected.input_snapshot || {}).map(([key, value]) => (
                  <div key={key}>
                    <span>{key.replace(/([A-Z])/g, " $1")}</span>
                    <strong>{String(value)}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="application-card">
              <h2>ML Risk Assessment</h2>

              <div className="detail-grid">
                <div>
                  <span>Default Prediction</span>
                  <strong>
                    {selected.prediction === 1
                      ? "Likely to Default"
                      : "Unlikely to Default"}
                  </strong>
                </div>

                <div>
                  <span>Default Probability</span>
                  <strong>{selected.default_probability}%</strong>
                </div>

                <div>
                  <span>Risk Level</span>
                  <strong>{selected.risk_level}</strong>
                </div>

                <div>
                  <span>Model Version</span>
                  <strong>{selected.model_version}</strong>
                </div>

                <div>
                  <span>Created At</span>
                  <strong>{selected.created_at}</strong>
                </div>

                <div>
                  <span>Last Updated</span>
                  <strong>{selected.updated_at}</strong>
                </div>
              </div>

              <p className="review-disclaimer">
                This prediction supports manual review. It does not
                automatically approve or reject a loan.
              </p>
            </div>

            <div className="application-card">
              <h2>Review Management</h2>

              <div className="review-form">
                <label>Review Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <label>Review Notes</label>
                <textarea
                  rows="4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter review observations..."
                />

                <button
                  className="application-button"
                  onClick={updateStatus}
                >
                  Save Review
                </button>
              </div>
            </div>

            <div className="application-card">
              <h2>Officer Assignment</h2>

              <div className="review-form">
                <label>Assigned Officer ID</label>
                <input
                  value={officer}
                  onChange={(e) => setOfficer(e.target.value)}
                  placeholder="Enter officer ID"
                />

                <button
                  className="application-button"
                  onClick={assignOfficer}
                >
                  Save Assignment
                </button>
              </div>
            </div>

            <div className="application-card history-card">
              <h2>Application Audit History</h2>

              {history.length === 0 ? (
                <p>No history available.</p>
              ) : (
                <div className="audit-list">
                  {history.map((item) => (
                    <div className="audit-item" key={item.id}>
                      <div className="audit-dot" />
                      <div>
                        <strong>{item.action}</strong>
                        <p>Changed by: {item.changed_by}</p>
                        <p>
                          Previous: {item.old_value == null
                            ? "None"
                            : JSON.stringify(item.old_value)}
                        </p>
                        <p>
                          New: {item.new_value == null
                            ? "None"
                            : JSON.stringify(item.new_value)}
                        </p>
                        <small>{item.changed_at}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </section>
  );
}

export default ApplicationManagement;
