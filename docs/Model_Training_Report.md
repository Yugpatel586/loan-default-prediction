# Model 1 – Logistic Regression

## Purpose

Logistic Regression was selected as the baseline machine learning model for predicting loan default because it is simple, computationally efficient, and suitable for binary classification problems.

### Parameters Used

- random_state = 42
- max_iter = 1000

---

## Results

| Metric | Value |
|---------|--------|
| Accuracy | 0.89 (89%) |
| Precision (Class 0) | 0.89 |
| Recall (Class 0) | 1.00 |
| F1-Score (Class 0) | 0.94 |
| Precision (Class 1) | 0.60 |
| Recall (Class 1) | 0.03 |
| F1-Score (Class 1) | 0.06 |

---

## Classification Report

| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| No Default (0) | 0.89 | 1.00 | 0.94 | 45,139 |
| Default (1) | 0.60 | 0.03 | 0.06 | 5,931 |

Overall Accuracy: **89%**

Macro Average:
- Precision: 0.74
- Recall: 0.51
- F1-Score: 0.50

Weighted Average:
- Precision: 0.85
- Recall: 0.89
- F1-Score: 0.84

---

## Observations

- Logistic Regression achieved an overall accuracy of 89%.
- The model predicted the "No Default" class with high accuracy.
- The recall for the "Default" class was very low (3%), indicating that the model failed to identify most default cases.
- - The low recall for the "Default" class is associated with the class imbalance in the dataset, where the "No Default" class has substantially more samples than the "Default" class.
- Although the overall accuracy appears high, the model is not suitable as the final model because accurately detecting default cases is the primary objective of this project.

---

## Conclusion

Logistic Regression serves as a good baseline model but is not the best choice for this dataset. More advanced models such as Decision Tree and Random Forest are expected to perform better, particularly in identifying loan default cases.w