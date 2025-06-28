from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.endpoints.chat import router as chat_router
from app.endpoints.rag import router as rag_router

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
app.include_router(chat_router, prefix="/api")
app.include_router(rag_router, prefix="/rag")
