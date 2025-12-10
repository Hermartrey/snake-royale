import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_full_game_lifecycle(client: AsyncClient):
    """
    Test a complete flow:
    1. User Signs Up
    2. User Logs In
    3. User Checks Profile (Me)
    4. User Checks Empty Leaderboard
    5. User Submits Score
    6. User Checks Leaderboard with Score
    """
    
    # 1. Signup
    email = "integration@snake.game"
    password = "securepassword"
    username = "IntegrationPlayer"
    
    resp_signup = await client.post("/api/auth/signup", json={
        "email": email,
        "username": username,
        "password": password
    })
    assert resp_signup.status_code == 201
    assert resp_signup.json()["success"] is True
    
    # 2. Login
    resp_login = await client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert resp_login.status_code == 200
    assert resp_login.json()["success"] is True
    
    # Simulate Auth Header (Standard Bearer since we don't have real JWT yet)
    # The current impl treats the token as the email in the mock logic.
    headers = {"Authorization": f"Bearer {email}"}
    
    # 3. Check Profile
    resp_me = await client.get("/api/auth/me", headers=headers)
    assert resp_me.status_code == 200
    assert resp_me.json()["email"] == email
    
    # 4. Check Leaderboard (Empty)
    resp_lb_empty = await client.get("/api/leaderboard")
    assert resp_lb_empty.status_code == 200
    assert len(resp_lb_empty.json()) == 0
    
    # 5. Submit Score
    score = 1500
    mode = "walls"
    resp_submit = await client.post("/api/leaderboard", json={
        "score": score,
        "mode": mode
    }, headers=headers)
    assert resp_submit.status_code == 200
    
    # 6. Check Leaderboard (Populated)
    resp_lb_filled = await client.get(f"/api/leaderboard?mode={mode}")
    assert resp_lb_filled.status_code == 200
    lb_data = resp_lb_filled.json()
    assert len(lb_data) == 1
    assert lb_data[0]["username"] == username
    assert lb_data[0]["score"] == score
