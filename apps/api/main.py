from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_client import Gauge

from database.session import test_connection
from modules.current_affairs.routes import router as current_affairs_router
from modules.news.routes import router as ingest_router
from modules.quizzes.routes import router as quiz_router
from modules.auth.routes import router as auth_router
from modules.user.routes import router as user_router

app = FastAPI(title="CruxAffairs Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://crux-affairs.vercel.app",
        "https://cruxaffairs.pankajk.dev",
    ],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(current_affairs_router)
app.include_router(ingest_router)
app.include_router(quiz_router)

Instrumentator().instrument(app).expose(app)

db_connection_status = Gauge(
    "db_connection_status", "Database connection status (1=connected, 0=error)"
)


@app.get("/health")
def health_status():
    db_ok = test_connection()
    db_connection_status.set(1 if db_ok else 0)
    return JSONResponse({"status": "ok", "database": "connected" if db_ok else "error"})
