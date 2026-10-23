
import { useState } from "react";

function ApplicationForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    Age: 25,
    Income: 50000,
    LoanAmount: 20000,
    CreditScore: 650,
    MonthsEmployed: 24,
    NumCreditLines: 2,
    InterestRate: 10,
    LoanTerm: 36,
    DTIRatio: 0.3,
    Education: "Bachelor's",
    EmploymentType: "Full-time",
    MaritalStatus: "Single",
    HasMortgage: "No",
    HasDependents: "No",
    LoanPurpose: "Home",
    HasCoSigner: "No",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const numericFields = [
      "Age", "Income", "LoanAmount", "CreditScore",
      "MonthsEmployed", "NumCreditLines", "InterestRate",
      "LoanTerm", "DTIRatio",
    ];

    const applicant = { ...formData };

    numericFields.forEach((field) => {
      applicant[field] = Number(applicant[field]);
    });

    onSubmit(applicant);
  };

  // --- SVG icons for section headers ---
  const sectionIcons = {
    personal: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    financial: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    employment: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    additional: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
    predict: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  };

  return (
    <form onSubmit={handleSubmit} className="applicant-form">
      {/* Personal Information */}
      <div className="form-section">
        <h3 className="form-section-title">
          {sectionIcons.personal}
          Personal Information
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="Age">Age</label>
            <input
              id="Age"
              type="number"
              name="Age"
              value={formData.Age}
              onChange={handleChange}
              step="any"
              required
              placeholder="e.g. 25"
            />
          </div>
          <div className="form-group">
            <label htmlFor="Education">Education</label>
            <select
              id="Education"
              name="Education"
              value={formData.Education}
              onChange={handleChange}
            >
              {["High School", "Bachelor's", "Master's", "PhD"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="MaritalStatus">Marital Status</label>
            <select
              id="MaritalStatus"
              name="MaritalStatus"
              value={formData.MaritalStatus}
              onChange={handleChange}
            >
              {["Single", "Married", "Divorced"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="HasDependents">Has Dependents</label>
            <select
              id="HasDependents"
              name="HasDependents"
              value={formData.HasDependents}
              onChange={handleChange}
            >
              {["Yes", "No"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="form-section">
        <h3 className="form-section-title">
          {sectionIcons.financial}
          Financial Information
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="Income">Annual Income ($)</label>
            <input
              id="Income"
              type="number"
              name="Income"
              value={formData.Income}
              onChange={handleChange}
              step="any"
              required
              placeholder="e.g. 50000"
            />
          </div>
          <div className="form-group">
            <label htmlFor="LoanAmount">Loan Amount ($)</label>
            <input
              id="LoanAmount"
              type="number"
              name="LoanAmount"
              value={formData.LoanAmount}
              onChange={handleChange}
              step="any"
              required
              placeholder="e.g. 20000"
            />
          </div>
          <div className="form-group">
            <label htmlFor="InterestRate">Interest Rate (%)</label>
            <input
              id="InterestRate"
              type="number"
              name="InterestRate"
              value={formData.InterestRate}
              onChange={handleChange}
              step="any"
              required
              placeholder="e.g. 10"
            />
          </div>
          <div className="form-group">
            <label htmlFor="LoanTerm">Loan Term (months)</label>
            <input
              id="LoanTerm"
              type="number"
              name="LoanTerm"
              value={formData.LoanTerm}
              onChange={handleChange}
              step="any"
              required
              placeholder="e.g. 36"
            />
          </div>
          <div className="form-group">
            <label htmlFor="DTIRatio">Debt-to-Income Ratio</label>
            <input
              id="DTIRatio"
              type="number"
              name="DTIRatio"
              value={formData.DTIRatio}
              onChange={handleChange}
              step="0.01"
              required
              placeholder="e.g. 0.30"
            />
          </div>
          <div className="form-group">
            <label htmlFor="LoanPurpose">Loan Purpose</label>
            <select
              id="LoanPurpose"
              name="LoanPurpose"
              value={formData.LoanPurpose}
              onChange={handleChange}
            >
              {["Home", "Auto", "Education", "Business", "Other"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="HasMortgage">Has Mortgage</label>
            <select
              id="HasMortgage"
              name="HasMortgage"
              value={formData.HasMortgage}
              onChange={handleChange}
            >
              {["Yes", "No"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employment & Credit Profile */}
      <div className="form-section">
        <h3 className="form-section-title">
          {sectionIcons.employment}
          Employment &amp; Credit Profile
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="EmploymentType">Employment Type</label>
            <select
              id="EmploymentType"
              name="EmploymentType"
              value={formData.EmploymentType}
              onChange={handleChange}
            >
              {["Full-time", "Part-time", "Self-employed", "Unemployed"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="MonthsEmployed">Months Employed</label>
            <input
              id="MonthsEmployed"
              type="number"
              name="MonthsEmployed"
              value={formData.MonthsEmployed}
              onChange={handleChange}
              step="any"
              required
              placeholder="e.g. 24"
            />
          </div>
          <div className="form-group">
            <label htmlFor="CreditScore">Credit Score</label>
            <input
              id="CreditScore"
              type="number"
              name="CreditScore"
              value={formData.CreditScore}
              onChange={handleChange}
              step="any"
              required
              placeholder="e.g. 650"
            />
          </div>
          <div className="form-group">
            <label htmlFor="NumCreditLines">Number of Credit Lines</label>
            <input
              id="NumCreditLines"
              type="number"
              name="NumCreditLines"
              value={formData.NumCreditLines}
              onChange={handleChange}
              step="any"
              required
              placeholder="e.g. 2"
            />
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="form-section">
        <h3 className="form-section-title">
          {sectionIcons.additional}
          Additional Details
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="HasCoSigner">Has Co-Signer</label>
            <select
              id="HasCoSigner"
              name="HasCoSigner"
              value={formData.HasCoSigner}
              onChange={handleChange}
            >
              {["Yes", "No"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="form-submit-wrapper">
        <button type="submit" className="predict-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" />
              Analyzing...
            </>
          ) : (
            <>
              {sectionIcons.predict}
              Predict Default Risk
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default ApplicationForm;
