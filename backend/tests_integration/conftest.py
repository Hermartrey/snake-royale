import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from src.main import app
from src.db.session import get_db
from src.db.base import Base

# Integration tests use a distinct in-memory DB or could use a file 'test_integration.db'
# Using in-memory for speed/isolation in this example, but labeled for integration.
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture(scope="function")
async def integration_db_session():
    # Use a new engine per test to ensure isolation
    engine = create_async_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
    
    async with SessionLocal() as session:
        yield session
        
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        
@pytest_asyncio.fixture(scope="function")
async def client(integration_db_session):
    async def override_get_db():
        yield integration_db_session
        
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://integration-test") as ac:
        yield ac
    
    app.dependency_overrides.clear()
