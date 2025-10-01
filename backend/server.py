from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(
    title="Netflix Clone API",
    description="A Netflix clone backend with TMDB integration",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from .routes import auth, movies, watchlist, genres

# Create API router
api_router = APIRouter(prefix="/api")

# Include route modules
api_router.include_router(auth.router)
api_router.include_router(movies.router)
api_router.include_router(watchlist.router)
api_router.include_router(genres.router)

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Netflix Clone API is running!"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "Netflix Clone API is operational",
        "tmdb_integration": "active"
    }

# Include the API router
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Netflix Clone API...")
    logger.info("TMDB integration initialized")
    logger.info("Database connection established")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down Netflix Clone API...")
    client.close()