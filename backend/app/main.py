"""EduShare API. Run on port 4000: the frontend's Vite proxy forwards /api there."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.db import init_db
from app.routes import resources


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="EduShare API",
    description="Free exam-prep resources, shared by African students and teachers.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_error(_request, exc: StarletteHTTPException):
    # The frontend/mock uses {"message": ...} for errors.
    return JSONResponse(status_code=exc.status_code, content={"message": exc.detail})


app.include_router(resources.router, prefix="/api")


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok"}
