from fastapi import APIRouter, UploadFile, File
from ..schema.message import ChatRequest, ChatResponse
from ..services.rag import RagService

router = APIRouter()
rag_service = RagService()

@router.post("/clear")
async def clear_rag_data():
    """RAGのデータ（PDFとベクトルストア）をクリアする"""
    await rag_service.clear_all_data()
    return {"message": "RAGデータがクリアされました"}

@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        return {"error": "アップロードされたファイルはPDFではありません"}
    
    content = await file.read()
    await rag_service.process_pdf(content, file.filename)
    return {"message": "PDFが正常にアップロードされました"}

@router.post("/chat", response_model=ChatResponse)
async def rag_chat(request: ChatRequest):
    return await rag_service.get_chat_response(request)