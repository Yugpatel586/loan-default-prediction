
import json
from pathlib import Path
from uuid import uuid4

import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.applications_db import get_connection, log_history


# Locate the saved ML model relative to this file
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR.parent / "ml" / "final_loan_default_pipeline.pkl"

# Load the trained pipeline
model = joblib.load(MODEL_PATH)

# Initialize FastAPI
app = FastAPI(
    title="Loan Default Prediction API",
    description="API for predicting loan default risk and managing loan applications",
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


# ---------------- APPLICANT INPUT SCHEMA ----------------

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


# ---------------- EXISTING ENDPOINTS ----------------

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


# ---------------- APPLICATION REVIEW MODELS ----------------

class ApplicationCreate(BaseModel):
    applicant_reference: str = Field(min_length=1, max_length=100)
    applicant: Applicant


class StatusUpdate(BaseModel):
    status: str
    changed_by: str = "Analyst"
    review_notes: str | None = None


class AssignmentUpdate(BaseModel):
    officer_id: str | None = None
    changed_by: str = "Analyst"


VALID_STATUSES = {
    "Pending",
    "Under Review",
    "Approved",
    "Rejected",
}


# ---------------- CREATE APPLICATION ----------------

@app.post("/applications")
def create_application(data: ApplicationCreate):

    applicant_data = data.applicant.model_dump()
    applicant_df = pd.DataFrame([applicant_data])

    prediction = int(model.predict(applicant_df)[0])
    probability = float(model.predict_proba(applicant_df)[0][1]) * 100

    if probability < 30:
        risk_level = "Low"
    elif probability < 60:
        risk_level = "Medium"
    else:
        risk_level = "High"

    case_id = f"APP-{uuid4().hex[:8].upper()}"

    with get_connection() as conn:

        conn.execute(
            """
            INSERT INTO applications (
                case_id,
                applicant_reference,
                input_snapshot,
                prediction,
                default_probability,
                risk_level
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                case_id,
                data.applicant_reference,
                json.dumps(applicant_data),
                prediction,
                round(probability, 2),
                risk_level,
            ),
        )

        log_history(
            conn,
            case_id,
            "Application Created",
            new_value={
                "risk_level": risk_level,
                "default_probability": round(probability, 2),
            },
        )

    return {
        "message": "Application created successfully",
        "case_id": case_id,
        "prediction": prediction,
        "default_probability": round(probability, 2),
        "risk_level": risk_level,
        "review_status": "Pending",
    }


# ---------------- LIST APPLICATIONS ----------------

@app.get("/applications")
def list_applications(
    risk_level: str | None = None,
    review_status: str | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):

    query = "SELECT * FROM applications WHERE 1=1"
    params = []

    if risk_level:
        query += " AND risk_level = ?"
        params.append(risk_level)

    if review_status:
        query += " AND review_status = ?"
        params.append(review_status)

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()

    applications = []

    for row in rows:
        item = dict(row)
        item["input_snapshot"] = json.loads(item["input_snapshot"])
        applications.append(item)

    return {
        "total_returned": len(applications),
        "applications": applications,
    }


# ---------------- APPLICATION DETAILS ----------------

@app.get("/applications/{case_id}")
def get_application(case_id: str):

    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM applications WHERE case_id = ?",
            (case_id,),
        ).fetchone()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    application = dict(row)

    application["input_snapshot"] = json.loads(
        application["input_snapshot"]
    )

    return application


# ---------------- UPDATE APPLICATION STATUS ----------------

@app.patch("/applications/{case_id}/status")
def update_application_status(
    case_id: str,
    data: StatusUpdate,
):

    if data.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Choose from: {sorted(VALID_STATUSES)}",
        )

    with get_connection() as conn:

        row = conn.execute(
            """
            SELECT review_status, review_notes
            FROM applications
            WHERE case_id = ?
            """,
            (case_id,),
        ).fetchone()

        if not row:
            raise HTTPException(
                status_code=404,
                detail="Application not found"
            )

        old_status = row["review_status"]
        old_notes = row["review_notes"]

        conn.execute(
            """
            UPDATE applications
            SET review_status = ?,
                review_notes = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE case_id = ?
            """,
            (
                data.status,
                data.review_notes
                if data.review_notes is not None
                else old_notes,
                case_id,
            ),
        )

        if old_status != data.status:
            log_history(
                conn,
                case_id,
                "Status Updated",
                old_value=old_status,
                new_value=data.status,
                changed_by=data.changed_by,
            )

        if (
            data.review_notes is not None
            and data.review_notes != old_notes
        ):
            log_history(
                conn,
                case_id,
                "Review Notes Updated",
                old_value=old_notes,
                new_value=data.review_notes,
                changed_by=data.changed_by,
            )

    return {
        "message": "Application status updated",
        "case_id": case_id,
        "review_status": data.status,
    }


# ---------------- ASSIGN APPLICATION TO OFFICER ----------------

@app.patch("/applications/{case_id}/assignment")
def assign_application(
    case_id: str,
    data: AssignmentUpdate,
):

    with get_connection() as conn:

        row = conn.execute(
            """
            SELECT assigned_officer_id
            FROM applications
            WHERE case_id = ?
            """,
            (case_id,),
        ).fetchone()

        if not row:
            raise HTTPException(
                status_code=404,
                detail="Application not found"
            )

        old_officer = row["assigned_officer_id"]

        conn.execute(
            """
            UPDATE applications
            SET assigned_officer_id = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE case_id = ?
            """,
            (data.officer_id, case_id),
        )

        if old_officer != data.officer_id:
            log_history(
                conn,
                case_id,
                "Officer Assignment Updated",
                old_value=old_officer,
                new_value=data.officer_id,
                changed_by=data.changed_by,
            )

    return {
        "message": "Officer assignment updated",
        "case_id": case_id,
        "assigned_officer_id": data.officer_id,
    }


# ---------------- APPLICATION AUDIT HISTORY ----------------

@app.get("/applications/{case_id}/history")
def get_application_history(case_id: str):

    with get_connection() as conn:

        application = conn.execute(
            """
            SELECT case_id
            FROM applications
            WHERE case_id = ?
            """,
            (case_id,),
        ).fetchone()

        if not application:
            raise HTTPException(
                status_code=404,
                detail="Application not found"
            )

        rows = conn.execute(
            """
            SELECT *
            FROM application_history
            WHERE case_id = ?
            ORDER BY changed_at DESC, id DESC
            """,
            (case_id,),
        ).fetchall()

    history = []

    for row in rows:
        item = dict(row)

        item["old_value"] = (
            json.loads(item["old_value"])
            if item["old_value"] is not None
            else None
        )

        item["new_value"] = (
            json.loads(item["new_value"])
            if item["new_value"] is not None
            else None
        )

        history.append(item)

    return {
        "case_id": case_id,
        "history": history,
    }
