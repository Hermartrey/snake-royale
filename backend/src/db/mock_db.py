from typing import Dict, List, Optional
from datetime import datetime
from uuid import uuid4
from ..models import schemas

class MockDatabase:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MockDatabase, cls).__new__(cls)
            cls._instance.users = {}  # email -> User + password
            cls._instance.leaderboard = []
            cls._instance.active_games = []
            cls._instance._initialize_demo_data()
        return cls._instance

    def _initialize_demo_data(self):
        # Demo user
        demo_user = {
            "id": "demo-user",
            "username": "DemoPlayer",
            "email": "demo@snake.game",
            "password": "demo123",
            "createdAt": datetime.now()
        }
        self.users["demo@snake.game"] = demo_user

        # Demo leaderboard
        self.leaderboard = [
            schemas.LeaderboardEntry(id='1', username='SnakeMaster', score=2450, mode='walls', date=datetime(2024, 12, 1)),
            schemas.LeaderboardEntry(id='2', username='PixelNinja', score=2100, mode='passthrough', date=datetime(2024, 12, 3)),
            schemas.LeaderboardEntry(id='3', username='RetroGamer', score=1850, mode='walls', date=datetime(2024, 12, 4)),
            schemas.LeaderboardEntry(id='4', username='SlipperySnek', score=1600, mode='passthrough', date=datetime(2024, 12, 5)),
            schemas.LeaderboardEntry(id='5', username='CobraKai', score=1200, mode='walls', date=datetime(2024, 12, 6)),
        ]

        # Demo active games
        self.active_games = [
            schemas.ActiveGame(
                id="game-1",
                playerId="player-1",
                playerName="SlipperySnek",
                score=150,
                mode="passthrough",
                snake=[{"x": 10, "y": 10}, {"x": 10, "y": 11}, {"x": 10, "y": 12}],
                food={"x": 5, "y": 5},
                direction="up",
                isActive=True
            ),
            schemas.ActiveGame(
                id="game-2",
                playerId="player-2",
                playerName="CobraKai",
                score=450,
                mode="walls",
                snake=[{"x": 20, "y": 20}, {"x": 21, "y": 20}, {"x": 22, "y": 20}],
                food={"x": 25, "y": 25},
                direction="left",
                isActive=True
            )
        ]

    async def get_user_by_email(self, email: str) -> Optional[dict]:
        return self.users.get(email)

    async def create_user(self, user_create: schemas.UserCreate) -> schemas.User:
        if user_create.email in self.users:
            raise ValueError("Email already registered")
        
        user_id = str(uuid4())
        user_data = {
            "id": user_id,
            "username": user_create.username,
            "email": user_create.email,
            "password": user_create.password,
            "createdAt": datetime.now()
        }
        self.users[user_create.email] = user_data
        return schemas.User(**user_data)

    async def get_leaderboard(self, mode: Optional[str] = None) -> List[schemas.LeaderboardEntry]:
        if mode:
            return sorted([e for e in self.leaderboard if e.mode == mode], key=lambda x: x.score, reverse=True)
        return sorted(self.leaderboard, key=lambda x: x.score, reverse=True)

    async def add_score(self, username: str, score: int, mode: str) -> int:
        entry = schemas.LeaderboardEntry(
            id=str(uuid4()),
            username=username,
            score=score,
            mode=mode,
            date=datetime.now()
        )
        self.leaderboard.append(entry)
        
        # Calculate rank
        sorted_scores = await self.get_leaderboard(mode)
        for i, e in enumerate(sorted_scores):
            if e.id == entry.id:
                return i + 1
        return len(sorted_scores)

    async def get_active_games(self) -> List[schemas.ActiveGame]:
        return [g for g in self.active_games if g.is_active]

    async def get_game(self, game_id: str) -> Optional[schemas.ActiveGame]:
        for game in self.active_games:
            if game.id == game_id:
                return game
        return None

    # Helper to simulate saving game state (just a stub in the mock)
    async def save_game_state(self, score: int, mode: str):
        pass

db = MockDatabase()
