from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database.session import test_connection
from modules.current_affairs.routes import router as current_affairs_router
from modules.news.routes import router as ingest_router
from modules.quizzes.routes import router as quiz_router
from modules.auth.routes import router as auth_router
from modules.user.routes import router as user_router

app = FastAPI(title="CruxAffairs Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(current_affairs_router)
app.include_router(ingest_router)
app.include_router(quiz_router)


@app.get("/health")
def health_status():
    db_ok = test_connection()
    return JSONResponse({"status": "ok", "database": "connected" if db_ok else "error"})
