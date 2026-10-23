"""Data layer: SQLite connection, schema and seed data."""
import os
import sqlite3
from contextlib import contextmanager


def db_path() -> str:
    return os.getenv("EDUSHARE_DB", "edushare.db")


@contextmanager
def get_conn():
    conn = sqlite3.connect(db_path())
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


# Same sample data as the frontend's Node mock, so the UI looks identical.
SEED = [
    ("KCSE Mathematics Revision Pack", "Short exercises and worked examples for Form 4 students.", "Mathematics", "Secondary", "English", 9),
    ("Primary Science Quiz Sheets", "Printable quiz sheets for classes preparing for local exams.", "Science", "Primary", "English", 6),
    ("Digital Skills Starter Guide", "Beginner notes for internet safety and basic computer use.", "ICT", "Secondary", "English", 5),
    ("Academic Writing Basics", "Sentence structure and essay planning for first-year students.", "English", "University", "English", 4),
    ("Bridge Algebra Notes", "Core algebra reminders for upper-primary transition learners.", "Mathematics", "Primary", "English", 7),
]


def init_db() -> None:
    with get_conn() as conn:
        conn.execute(
            """CREATE TABLE IF NOT EXISTS resources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                subject TEXT NOT NULL,
                level TEXT NOT NULL,
                language TEXT NOT NULL DEFAULT 'English',
                url TEXT NOT NULL DEFAULT '',
                helpful_count INTEGER NOT NULL DEFAULT 0,
                flags INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )"""
        )
        if conn.execute("SELECT COUNT(*) FROM resources").fetchone()[0] == 0:
            conn.executemany(
                "INSERT INTO resources (title, description, subject, level, language, helpful_count) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                SEED,
            )
