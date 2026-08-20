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

Logistic Regression serves as a good baseline model but is not the best choice for this dataset. More advanced models such as Decision Tree and Random Forest are expected to perform better, particularly in identifying loan default cases.
# Model 1B – Logistic Regression with Class Weighting

## Purpose

The baseline Logistic Regression model achieved high overall accuracy but performed poorly in identifying loan defaulters, with only 3% recall for the Default class. This indicated that the model was strongly affected by class imbalance in the dataset.

To address this issue, Logistic Regression was retrained using `class_weight="balanced"`. This gives greater importance to the minority Default class during model training.

## Parameters Used

* `random_state = 42`
* `max_iter = 1000`
* `class_weight = "balanced"`

## Results

| Metric                        | Value              |
| ----------------------------- | ------------------ |
| Accuracy                      | 0.674 (67.40%)     |
| Precision (Class 1 – Default) | 0.219 (21.88%)     |
| Recall (Class 1 – Default)    | **0.703 (70.31%)** |
| F1-Score (Class 1 – Default)  | **0.334 (33.37%)** |

## Classification Report

| Class          | Precision | Recall   | F1-Score | Support |
| -------------- | --------- | -------- | -------- | ------- |
| No Default (0) | 0.94      | 0.67     | 0.78     | 45,139  |
| Default (1)    | 0.22      | **0.70** | 0.33     | 5,931   |

Overall Accuracy: **67.40%**

Macro Average:

* Precision: 0.58
* Recall: 0.69
* F1-Score: 0.56

Weighted Average:

* Precision: 0.86
* Recall: 0.67
* F1-Score: 0.73

## Confusion Matrix

```text
[[30251 14888]
 [ 1761  4170]]
```

Where:

* True Negative (TN) = 30,251
* False Positive (FP) = 14,888
* False Negative (FN) = 1,761
* True Positive (TP) = 4,170

## Observations

* Class weighting significantly improved the model's ability to identify loan defaulters.
* Default-class Recall increased from **3% to 70.31%** compared with the baseline Logistic Regression model.
* However, overall Accuracy decreased from **89% to 67.40%**.
* Default-class Precision was only **21.88%**, indicating that a significant number of non-defaulters were incorrectly classified as defaulters.
* The model successfully reduced the problem of missing actual defaulters but introduced a large number of False Positives.
* This demonstrates a clear **Precision-Recall trade-off**.

## Conclusion

Logistic Regression with class weighting performed significantly better than the baseline model in detecting loan defaulters. The increase in Default Recall from 3% to 70.31% makes the model more suitable for identifying high-risk borrowers. However, its low Default Precision and reduced overall accuracy indicate that further optimization is required.

Therefore, probability **threshold tuning** was performed as the next step to achieve a better balance between Precision and Recall.

---

# Model 1C – Threshold-Tuned Balanced Logistic Regression

## Purpose

Although class weighting significantly improved Default-class Recall, the balanced Logistic Regression model produced a large number of False Positives. Therefore, probability threshold tuning was performed to find a better balance between identifying actual defaulters and incorrectly classifying non-defaulters as defaulters.

By default, a binary classification model uses a probability threshold of **0.50**:

```text
Probability >= 0.50 → Default
Probability < 0.50 → No Default
```

Different thresholds were tested to determine which provided the best balance between Precision and Recall.

## Thresholds Tested

The following thresholds were evaluated:

```text
0.30, 0.35, 0.40, 0.45, 0.50,
0.55, 0.60, 0.65, 0.70
```

## Threshold Comparison

| Threshold | Accuracy   | Precision  | Recall     | F1-Score   |
| --------- | ---------- | ---------- | ---------- | ---------- |
| 0.30      | 39.76%     | 15.22%     | 91.59%     | 26.10%     |
| 0.35      | 47.09%     | 16.46%     | 87.25%     | 27.70%     |
| 0.40      | 54.53%     | 18.07%     | 82.52%     | 29.65%     |
| 0.45      | 61.18%     | 19.81%     | 76.87%     | 31.50%     |
| 0.50      | 67.40%     | 21.88%     | 70.31%     | 33.37%     |
| 0.55      | 72.87%     | 24.19%     | 62.60%     | 34.90%     |
| **0.60**  | **77.52%** | **26.82%** | **54.11%** | **35.86%** |
| 0.65      | 81.49%     | 29.91%     | 44.19%     | 35.68%     |
| 0.70      | 84.47%     | 33.53%     | 34.35%     | 33.93%     |

## Selected Threshold

**0.60**

Among the evaluated thresholds, a threshold of **0.60 produced the highest F1-Score of 35.86%**. Therefore, it was selected as the current operating threshold for the balanced Logistic Regression model.

## Final Results

| Metric                        | Value               |
| ----------------------------- | ------------------- |
| Threshold                     | **0.60**            |
| Accuracy                      | **0.7752 (77.52%)** |
| Precision (Class 1 – Default) | **0.2682 (26.82%)** |
| Recall (Class 1 – Default)    | **0.5411 (54.11%)** |
| F1-Score (Class 1 – Default)  | **0.3586 (35.86%)** |

## Classification Report

| Class          | Precision | Recall   | F1-Score | Support |
| -------------- | --------- | -------- | -------- | ------- |
| No Default (0) | 0.93      | 0.81     | 0.86     | 45,139  |
| Default (1)    | 0.27      | **0.54** | **0.36** | 5,931   |

Overall Accuracy: **77.52%**

Macro Average:

* Precision: 0.60
* Recall: 0.67
* F1-Score: 0.61

Weighted Average:

* Precision: 0.85
* Recall: 0.78
* F1-Score: 0.81

## Confusion Matrix

```text
[[36383  8756]
 [ 2722  3209]]
```

Where:

* True Negative (TN) = 36,383
* False Positive (FP) = 8,756
* False Negative (FN) = 2,722
* True Positive (TP) = 3,209

## Observations

* Threshold tuning improved the balance between Precision and Recall compared with the default threshold of 0.50.
* At threshold 0.60, Default-class Precision increased from **21.88% to 26.82%**.
* Default-class Recall decreased from **70.31% to 54.11%**.
* The F1-Score improved from **33.37% to 35.86%**.
* Overall Accuracy increased from **67.40% to 77.52%**.
* The number of False Positives was reduced from **14,888 to 8,756**.
* Although some actual defaulters are missed at the higher threshold, the model provides a better Precision-Recall balance.
* Further improvement will be explored using other classification algorithms.

## Conclusion

Threshold tuning improved the balanced Logistic Regression model by providing a better trade-off between detecting loan defaulters and reducing false alarms. Among the tested thresholds, **0.60 achieved the highest F1-Score** and was therefore selected as the current threshold.

However, the Default-class Precision remains relatively low, indicating that the model can still incorrectly classify many non-defaulters as defaulters. Therefore, additional models such as **Decision Tree, Random Forest, and XGBoost** will be trained and compared to identify a more effective final model.

---

# Current Model Comparison

| Model / Experiment                                  | Accuracy   | Default Precision | Default Recall | Default F1 |
| --------------------------------------------------- | ---------- | ----------------- | -------------- | ---------- |
| Logistic Regression                                 | 89.00%     | 60.00%            | 3.00%          | 6.00%      |
| Logistic Regression + Class Weight                  | 67.40%     | 21.88%            | **70.31%**     | 33.37%     |
| Logistic Regression + Class Weight + Threshold 0.60 | **77.52%** | **26.82%**        | 54.11%         | **35.86%** |

## Current Status

The Logistic Regression experiments have been completed. The experiments demonstrated that class imbalance has a significant effect on the model's ability to detect loan defaults. Class weighting substantially improved Default Recall, while threshold tuning improved the Precision-Recall balance.

**Next Model: Decision Tree Classifier**
