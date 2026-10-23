import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("EDUSHARE_DB", str(tmp_path / "test.db"))
    from app.main import app
    with TestClient(app) as c:
        yield c


NEW = {"title": "WAEC Physics Notes", "description": "Notes", "subject": "Physics",
       "level": "secondary", "url": "https://example.org/phys"}


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_list_matches_frontend_contract(client):
    body = client.get("/api/resources").json()
    assert set(body) == {"resources"}
    first = body["resources"][0]
    for key in ("id", "title", "description", "subject", "level", "language", "helpfulCount"):
        assert key in first
    counts = [r["helpfulCount"] for r in body["resources"]]
    assert counts == sorted(counts, reverse=True)


def test_filters(client):
    maths = client.get("/api/resources?subject=Mathematics").json()["resources"]
    assert len(maths) == 2 and all(r["subject"] == "Mathematics" for r in maths)
    both = client.get("/api/resources?subject=Mathematics&level=Primary").json()["resources"]
    assert len(both) == 1
    assert client.get("/api/resources?q=algebra").json()["resources"][0]["title"] == "Bridge Algebra Notes"


def test_helpful_returns_wrapped_resource(client):
    before = client.get("/api/resources/2").json()["resource"]["helpfulCount"]
    r = client.post("/api/resources/2/helpful")
    assert r.status_code == 200
    assert r.json()["resource"]["helpfulCount"] == before + 1


def test_create_normalises_level(client):
    r = client.post("/api/resources", json=NEW)
    assert r.status_code == 201
    assert r.json()["resource"]["level"] == "Secondary"
    assert r.json()["resource"]["language"] == "English"


def test_validation(client):
    assert client.post("/api/resources", json={**NEW, "url": "not-a-url"}).status_code == 422
    assert client.post("/api/resources", json={**NEW, "level": "kindergarten"}).status_code == 422


def test_flagged_hidden(client):
    rid = client.post("/api/resources", json=NEW).json()["resource"]["id"]
    for _ in range(3):
        client.post(f"/api/resources/{rid}/flag")
    assert rid not in [r["id"] for r in client.get("/api/resources").json()["resources"]]


def test_404_uses_message_key(client):
    r = client.post("/api/resources/9999/helpful")
    assert r.status_code == 404 and r.json() == {"message": "Resource not found"}
