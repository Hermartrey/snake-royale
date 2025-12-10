from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import db as models
from ..models import schemas
from datetime import datetime

class DatabaseRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_by_email(self, email: str) -> models.User | None:
        stmt = select(models.User).where(models.User.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_user(self, user_create: schemas.UserCreate) -> models.User:
        existing = await self.get_user_by_email(user_create.email)
        if existing:
            raise ValueError("Email already registered")
        
        new_user = models.User(
            username=user_create.username,
            email=user_create.email,
            password=user_create.password # TODO: Hash password
        )
        self.session.add(new_user)
        try:
            await self.session.commit()
            await self.session.refresh(new_user)
        except Exception:
            await self.session.rollback()
            raise
        return new_user

    async def get_leaderboard(self, mode: str = None):
        stmt = select(models.LeaderboardEntry)
        if mode:
            stmt = stmt.where(models.LeaderboardEntry.mode == mode)
        stmt = stmt.order_by(desc(models.LeaderboardEntry.score))
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def add_score(self, username: str, score: int, mode: str) -> int:
        entry = models.LeaderboardEntry(
            username=username,
            score=score,
            mode=mode
        )
        self.session.add(entry)
        await self.session.commit()
        
        # Calculate rank
        stmt = select(func.count()).select_from(models.LeaderboardEntry).where(
            models.LeaderboardEntry.mode == mode,
            models.LeaderboardEntry.score > score
        )
        result = await self.session.execute(stmt)
        rank = result.scalar() + 1
        return rank

    async def get_active_games(self):
        stmt = select(models.ActiveGame).where(models.ActiveGame.is_active == True)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_game(self, game_id: str) -> models.ActiveGame | None:
        stmt = select(models.ActiveGame).where(models.ActiveGame.id == game_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
        
    async def save_game_state(self, score: int, mode: str):
        # Stub
        pass
