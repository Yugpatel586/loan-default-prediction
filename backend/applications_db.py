
import json
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "applications.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def initialize_database():
    with get_connection() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_id TEXT NOT NULL UNIQUE,
                applicant_reference TEXT NOT NULL,
                input_snapshot TEXT NOT NULL,
                prediction INTEGER NOT NULL,
                default_probability REAL NOT NULL,
                risk_level TEXT NOT NULL,
                review_status TEXT NOT NULL DEFAULT 'Pending',
                assigned_officer_id TEXT,
                review_notes TEXT NOT NULL DEFAULT '',
                model_version TEXT NOT NULL DEFAULT '1.0.0',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS application_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_id TEXT NOT NULL,
                action TEXT NOT NULL,
                old_value TEXT,
                new_value TEXT,
                changed_by TEXT NOT NULL DEFAULT 'system',
                changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id)
                    REFERENCES applications(case_id)
                    ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_applications_risk
                ON applications(risk_level);

            CREATE INDEX IF NOT EXISTS idx_applications_status
                ON applications(review_status);

            CREATE INDEX IF NOT EXISTS idx_history_case
                ON application_history(case_id);
        """)


def log_history(
    conn,
    case_id,
    action,
    old_value=None,
    new_value=None,
    changed_by="system",
):
    conn.execute(
        """
        INSERT INTO application_history
        (case_id, action, old_value, new_value, changed_by)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            case_id,
            action,
            json.dumps(old_value),
            json.dumps(new_value),
            changed_by,
        ),
    )


initialize_database()
