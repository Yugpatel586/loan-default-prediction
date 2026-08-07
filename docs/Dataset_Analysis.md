## Feature Classification

### Identifier
- LoanID

### Numerical Features
- Age
- Income
- LoanAmount
- CreditScore
- MonthsEmployed
- NumCreditLines
- InterestRate
- LoanTerm
- DTIRatio

### Categorical Features
- Education
- EmploymentType
- MaritalStatus
- LoanPurpose

### Boolean Features
- HasMortgage
- HasDependents
- HasCoSigner

### Target Variable
- Default

### Initial Observation

The dataset contains a combination of numerical, categorical, and boolean features suitable for a binary classification problem. The LoanID column is a unique identifier and will be removed during preprocessing because it has no predictive value.
## Initial Dataset Exploration

### Dataset Shape
- Rows: 255,347
- Columns: 18

### Missing Values
- No missing values found.

### Data Types
- Integer: 8
- Float: 2
- String: 8

### Target Variable Distribution
- No Default (0): 225,694
- Default (1): 29,653

### Initial Observations
- Dataset is clean with no missing values.
- Numerical and categorical features are present.
- Target variable is imbalanced.
- LoanID is a unique identifier and will be removed during preprocessing.
## Exploratory Data Analysis (EDA)

### Target Variable Distribution

A count plot of the target variable shows that the dataset is imbalanced.

- No Default (0): 225,694 (≈88.4%)
- Default (1): 29,653 (≈11.6%)

### Observation

The majority of applicants successfully repay their loans. Since default cases are much fewer than non-default cases, the dataset is imbalanced. During model training, suitable evaluation metrics and imbalance-handling techniques will be considered.
### Age Distribution

- Age ranges from 18 to 69 years.
- The distribution is approximately uniform.
- No significant outliers or missing values were observed.

### Income Distribution

- Income ranges from 15,000 to 150,000.
- The distribution is approximately uniform.
- No significant outliers or missing values were observed.

### Observation

Both features appear clean and suitable for machine learning. The dataset shows a nearly uniform distribution, indicating that it is likely a synthetic dataset created for learning and experimentation.
## Exploratory Data Analysis (Phase 2)

### Correlation Analysis
- Generated a correlation heatmap for all numerical features.
- Observed relationships between features and the target variable.

### Categorical Feature Analysis
- Visualized the distribution of Education, Employment Type, and Loan Purpose.

### Feature vs Target Analysis
- Compared Credit Score, Income, and Loan Amount with the Default variable using box plots.
- These visualizations help identify patterns that may influence loan default.

### Data Preprocessing – Step 1
Removed the LoanID column.
Reason: LoanID is a unique identifier and does not contribute to predicting loan default.
Removing non-informative features helps reduce unnecessary complexity and prevents the model from learning irrelevant patterns.