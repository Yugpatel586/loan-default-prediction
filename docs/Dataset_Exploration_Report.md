# Advanced Exploratory Data Analysis

## Correlation Analysis

A correlation heatmap was generated for all numerical features.

### Observations

- Age has a slight negative correlation with Default (-0.17).
- Income has a slight negative correlation with Default (-0.10).
- Loan Amount has a slight positive correlation with Default (0.09).
- Interest Rate has a slight positive correlation with Default (0.13).
- Credit Score shows a weak negative correlation (-0.03).

Overall, no strong linear correlation exists between the numerical features and the target variable.

---

## Education Distribution

Education categories are almost equally distributed.

No dominant education category was observed.

---

## Employment Type Distribution

Employment types are uniformly distributed.

The dataset contains Full-time, Part-time, Self-employed and Unemployed applicants.

---

## Loan Purpose Distribution

Loan purposes are evenly distributed.

No category dominates the dataset.

---

## Feature vs Target Analysis

### Credit Score vs Default

Applicants who default generally have a slightly lower median credit score.

---

### Income vs Default

Applicants with lower income show a slightly higher probability of default.

---

### Loan Amount vs Default

Applicants requesting higher loan amounts show a slightly higher tendency to default.

---

# Final EDA Conclusion

The dataset is clean and suitable for machine learning.

Key observations include:

- No missing values
- No major outliers
- Numerical features have valid ranges
- Target variable is imbalanced
- Most numerical features have weak correlations with the target variable
- The dataset appears to be synthetically generated but is appropriate for educational machine learning projects. 
## Data Preprocessing

### Feature Classification

- Identified numerical and categorical features.
- Numerical features include Age, Income, Loan Amount, Credit Score, Interest Rate, Loan Term, etc.
- Categorical features include Education, Employment Type, Marital Status, Loan Purpose, HasMortgage, HasDependents, and HasCoSigner.

### Label Encoding

- Applied Label Encoding to all categorical features.
- Converted text categories into numerical values.
- Stored LabelEncoder objects for future use during prediction.

## Feature Scaling

Feature scaling was performed using StandardScaler from Scikit-learn.

Purpose:
- Normalize feature values to a common scale.
- Improve the performance of machine learning algorithms that are sensitive to feature magnitude.

Observations:
- The transformed features have approximately zero mean and unit standard deviation.
- The dataset is now ready for model training.