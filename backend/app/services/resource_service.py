"""Business logic and queries. All SQL lives here so a later move to PostgreSQL
only touches this file and db.py."""
from typing import Optional

from app.db import get_conn
from app.models import ResourceCreate

FLAG_HIDE_THRESHOLD = 3  # resources flagged this many times are hidden


def _to_dict(row) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "subject": row["subject"],
        "level": row["level"],
        "language": row["language"],
        "helpfulCount": row["helpful_count"],
        "url": row["url"],
    }


def list_resources(subject: Optional[str] = None, level: Optional[str] = None,
                   q: Optional[str] = None) -> list[dict]:
    sql = "SELECT * FROM resources WHERE flags < ?"
    params: list = [FLAG_HIDE_THRESHOLD]
    if subject:
        sql += " AND LOWER(subject) = LOWER(?)"
        params.append(subject)
    if level:
        sql += " AND LOWER(level) = LOWER(?)"
        params.append(level)
    if q:
        sql += " AND (title LIKE ? OR description LIKE ?)"
        params += [f"%{q}%", f"%{q}%"]
    sql += " ORDER BY helpful_count DESC, id DESC"
    with get_conn() as conn:
        return [_to_dict(r) for r in conn.execute(sql, params).fetchall()]


def get_resource(resource_id: int) -> Optional[dict]:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM resources WHERE id = ?", (resource_id,)).fetchone()
        return _to_dict(row) if row else None


def create_resource(data: ResourceCreate) -> dict:
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO resources (title, description, subject, level, language, url) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (data.title, data.description, data.subject, data.level, data.language, data.url),
        )
        new_id = cur.lastrowid
    return get_resource(new_id)


def _bump(resource_id: int, column: str) -> Optional[dict]:
    assert column in ("helpful_count", "flags")
    with get_conn() as conn:
        cur = conn.execute(f"UPDATE resources SET {column} = {column} + 1 WHERE id = ?", (resource_id,))
        if cur.rowcount == 0:
            return None
    return get_resource(resource_id)


def mark_helpful(resource_id: int) -> Optional[dict]:
    return _bump(resource_id, "helpful_count")


def flag_resource(resource_id: int) -> Optional[dict]:
    return _bump(resource_id, "flags")
