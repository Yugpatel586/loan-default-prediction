
from pathlib import Path

import joblib
import pandas as pd

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# Locate the saved ML model relative to this file
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR.parent / "ml" / "final_loan_default_pipeline.pkl"

# Load the trained pipeline
model = joblib.load(MODEL_PATH)

# Initialize FastAPI
app = FastAPI(
    title="Loan Default Prediction API",
    description="API for predicting loan default risk",
    version="1.0.0"
)

# Allow requests from the local React development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Applicant input schema
class Applicant(BaseModel):
    Age: int = Field(ge=18, le=100)
    Income: float = Field(ge=0)
    LoanAmount: float = Field(ge=0)
    CreditScore: int = Field(ge=0, le=900)
    MonthsEmployed: int = Field(ge=0)
    NumCreditLines: int = Field(ge=0)
    InterestRate: float = Field(ge=0)
    LoanTerm: int = Field(gt=0)
    DTIRatio: float = Field(ge=0)
    Education: str
    EmploymentType: str
    MaritalStatus: str
    HasMortgage: str
    HasDependents: str
    LoanPurpose: str
    HasCoSigner: str


@app.get("/")
def home():
    return {
        "message": "Loan Default Prediction API is running"
    }


@app.post("/predict")
def predict(applicant: Applicant):
    applicant_df = pd.DataFrame([applicant.model_dump()])

    # Predict class and default probability
    prediction = int(model.predict(applicant_df)[0])
    probability = float(model.predict_proba(applicant_df)[0][1])

    # Current illustrative risk bands
    if probability < 0.30:
        risk_level = "Low"
    elif probability < 0.60:
        risk_level = "Medium"
    else:
        risk_level = "High"

    return {
        "prediction": prediction,
        "default_probability": round(probability * 100, 2),
        "risk_level": risk_level
    }