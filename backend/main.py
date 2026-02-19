from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging
from dotenv import load_dotenv
from routes import query, calm, dashboard, plan, knowledge, craving, user, analytics, voice_chat, game, resources, chat
from services.routes import analyzer

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="Nicotine Recovery AI Assistant")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Frontend development server
        "http://localhost:3000",  # Alternative frontend development port
        "http://127.0.0.1:5173",  # Frontend development server (alternative)
        "http://127.0.0.1:3000",  # Alternative frontend development port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(query.router, prefix="/api", tags=["query"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(calm.router, prefix="/api", tags=["calm"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(plan.router, prefix="/api", tags=["plan"])
app.include_router(knowledge.router, prefix="/api", tags=["knowledge"])
app.include_router(craving.router, prefix="/api", tags=["craving"])
app.include_router(user.router, prefix="/api", tags=["user"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(voice_chat.router, prefix="/api", tags=["voice_chat"])
app.include_router(game.router, prefix="/api", tags=["game"])
app.include_router(resources.router, prefix="/api", tags=["resources"])
app.include_router(analyzer.router)

# Create necessary directories
os.makedirs("data/users", exist_ok=True)
os.makedirs("data/chat_history", exist_ok=True)
os.makedirs("data/knowledge_base", exist_ok=True)
os.makedirs("data/logs", exist_ok=True)
logger.info("Created necessary data directories")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Nicotine Recovery AI Assistant is running"}

# Root endpoint
@app.get("/", tags=["root"])
async def read_root():
    return {"message": "Nicotine Recovery App Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)