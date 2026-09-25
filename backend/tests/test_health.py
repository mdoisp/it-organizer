from unittest.mock import Mock

from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app.core.database import get_db
from app.main import app

client = TestClient(app)


def test_liveness():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "backend"}


def test_readiness_handles_database_failure():
    session = Mock()
    session.execute.side_effect = OperationalError("SELECT 1", {}, Exception("offline"))
    app.dependency_overrides[get_db] = lambda: session
    try:
        response = client.get("/ready")
        assert response.status_code == 503
        assert response.json() == {"detail": "Database unavailable"}
    finally:
        app.dependency_overrides.clear()
