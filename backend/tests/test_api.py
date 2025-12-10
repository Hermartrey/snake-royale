from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Snake Royale API"}

def test_login_demo():
    response = client.post("/api/auth/login", json={
        "email": "demo@snake.game",
        "password": "demo123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["email"] == "demo@snake.game"

def test_login_invalid():
    response = client.post("/api/auth/login", json={
        "email": "demo@snake.game",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

def test_signup_new_user():
    # Use a unique email
    email = "newuser@snake.game"
    response = client.post("/api/auth/signup", json={
        "email": email,
        "username": "NewUser",
        "password": "password123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["user"]["username"] == "NewUser"

def test_signup_existing_email():
    response = client.post("/api/auth/signup", json={
        "email": "demo@snake.game",
        "username": "DemoClone",
        "password": "password"
    })
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_get_me():
    # Currently mocked to always return demo user if we rely on the dependency defaults
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    assert response.json()["username"] == "DemoPlayer"

def test_get_leaderboard():
    response = client.get("/api/leaderboard")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0

def test_get_leaderboard_filtered():
    response = client.get("/api/leaderboard?mode=walls")
    assert response.status_code == 200
    data = response.json()
    assert all(entry["mode"] == "walls" for entry in data)

def test_submit_score():
    response = client.post("/api/leaderboard", json={
        "score": 100,
        "mode": "passthrough"
    })
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "rank" in response.json()

def test_get_active_games():
    response = client.get("/api/games/active")
    assert response.status_code == 200
    # Initially empty in mock db unless demo data added active games (it didn't)
    assert isinstance(response.json(), list)

def test_save_game():
    response = client.post("/api/games/save", json={
        "score": 500,
        "mode": "walls"
    })
    assert response.status_code == 200
    assert response.json()["success"] is True
