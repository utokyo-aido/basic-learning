from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.endpoints.chat import router as chat_router
from backend.app.endpoints.rag import router as rag_router
from backend.app.endpoints.session import router as session_router

app = FastAPI()

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの追加
app.include_router(session_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(rag_router, prefix="/rag")
