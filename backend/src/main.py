from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os
from .api.routes import router
from .db.session import engine
from .db.base import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="Snake Royale API", version="1.0.0", lifespan=lifespan)

# CORS Configuration
# In a real app, strict allow_origins is recommended
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

# Serve React App
# We expect the frontend build to be in a 'static' directory
static_dir = "static"

if os.path.exists(static_dir):
    # Mount assets specifically if they exist to let StaticFiles handle them (better performance/caching)
    if os.path.exists(os.path.join(static_dir, "assets")):
        app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    # Catch-all for SPA
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # Allow API calls to pass through (though they should match above)
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not Found")
            
        # Check if a specific file exists in static (e.g. vite.svg, robots.txt)
        file_path = os.path.join(static_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Otherwise return index.html for client-side routing
        return FileResponse(os.path.join(static_dir, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {"message": "Welcome to Snake Royale API (Frontend not built/served)"}
