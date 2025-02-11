from fastapi import APIRouter, UploadFile, File, Form
from ..schema.message import ChatRequest, ChatResponse
from ..services.rag import RagService

router = APIRouter()
rag_service = RagService()

@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...), session_id: str = Form(...)):
    if not file.filename.endswith('.pdf'):
        return {"error": "アップロードされたファイルはPDFではありません"}
    
    content = await file.read()
    await rag_service.process_pdf(content, file.filename, session_id)
    return {"message": "PDFが正常にアップロードされました"}

@router.post("/chat", response_model=ChatResponse)
async def rag_chat(request: ChatRequest):
    return await rag_service.get_chat_response(request)

@router.post("/clear/{session_id}")
async def clear_session_data(session_id: str):
    """特定のセッションのRAGデータをクリアする"""
    rag_service.clear_session_data(session_id)
    return {"message": "セッションのRAGデータがクリアされました"}