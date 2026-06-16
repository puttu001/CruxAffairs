from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database.session import test_connection
from modules.current_affairs.routes import router as current_affairs_router

app = FastAPI(title="CruxAffairs Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(current_affairs_router)


@app.get("/health")
def health_status():
    db_ok = test_connection()
    return JSONResponse({"status": "ok", "database": "connected" if db_ok else "error"})
