from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime
from uuid import UUID, uuid4

class User(BaseModel):
    id: str
    username: str
    email: EmailStr
    created_at: datetime = Field(alias="createdAt")

    model_config = ConfigDict(populate_by_name=True)

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class LeaderboardEntry(BaseModel):
    id: str
    username: str
    score: int
    mode: Literal['passthrough', 'walls']
    date: datetime

class ScoreSubmission(BaseModel):
    score: int
    mode: Literal['passthrough', 'walls']

class Point(BaseModel):
    x: int
    y: int

class ActiveGame(BaseModel):
    id: str
    player_id: str = Field(alias="playerId")
    player_name: str = Field(alias="playerName")
    score: int
    mode: Literal['passthrough', 'walls']
    snake: List[Point]
    food: Point
    direction: Literal['up', 'down', 'left', 'right']
    is_active: bool = Field(alias="isActive")

    model_config = ConfigDict(populate_by_name=True)

class GameStateSave(BaseModel):
    score: int
    mode: Literal['passthrough', 'walls']
