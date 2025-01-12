from fastapi import APIRouter
from ..schema.message import ChatRequest, ChatResponse
from ..services.chat import ChatService

router = APIRouter()
chat_service = ChatService()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    return await chat_service.get_chat_response(request)

