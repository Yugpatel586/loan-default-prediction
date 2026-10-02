
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

  const fields = [
    { name: "Age", label: "Age", type: "number" },
    { name: "Income", label: "Annual Income", type: "number" },
    { name: "LoanAmount", label: "Loan Amount", type: "number" },
    { name: "CreditScore", label: "Credit Score", type: "number" },
    { name: "MonthsEmployed", label: "Months Employed", type: "number" },
    { name: "NumCreditLines", label: "Number of Credit Lines", type: "number" },
    { name: "InterestRate", label: "Interest Rate (%)", type: "number" },
    { name: "LoanTerm", label: "Loan Term (months)", type: "number" },
    { name: "DTIRatio", label: "Debt-to-Income Ratio", type: "number", step: "0.01" },
  ];

  const categories = {
    Education: ["High School", "Bachelor's", "Master's", "PhD"],
    EmploymentType: ["Full-time", "Part-time", "Self-employed", "Unemployed"],
    MaritalStatus: ["Single", "Married", "Divorced"],
    HasMortgage: ["Yes", "No"],
    HasDependents: ["Yes", "No"],
    LoanPurpose: ["Home", "Auto", "Education", "Business", "Other"],
    HasCoSigner: ["Yes", "No"],
  };

  return (
    <form onSubmit={handleSubmit} className="applicant-form">
      <h2>Applicant Details</h2>

      <div className="form-grid">
        {fields.map((field) => (
          <div className="form-group" key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            <input
              id={field.name}
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              step={field.step || "any"}
              required
            />
          </div>
        ))}

        {Object.entries(categories).map(([name, options]) => (
          <div className="form-group" key={name}>
            <label htmlFor={name}>{name}</label>
            <select
              id={name}
              name={name}
              value={formData[name]}
              onChange={handleChange}
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Analyzing..." : "Predict Default Risk"}
      </button>
    </form>
  );
}

export default ApplicationForm;
