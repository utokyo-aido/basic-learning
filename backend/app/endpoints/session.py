from fastapi import APIRouter, HTTPException
from ..schema.message import ApiKeyRequest, SessionResponse
from ..services.session import session_store
from langchain_openai import ChatOpenAI

router = APIRouter()

@router.post("/register_api_key", response_model=SessionResponse)
async def register_api_key(request: ApiKeyRequest):
    try:
        # APIキーの有効性を確認
        ChatOpenAI(api_key=request.api_key).invoke(["test"])
        
        # 有効なAPIキーの場合、セッションを作成
        session_id = session_store.create_session(request.api_key)
        return SessionResponse(session_id=session_id)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail="Invalid API key"
        )

@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    session_store.delete_session(session_id)
    return {"message": "Session deleted successfully"}