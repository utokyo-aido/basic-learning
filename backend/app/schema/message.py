from pydantic import BaseModel
from typing import List, Optional

class Message(BaseModel):
    role: str
    content: str

class ApiKeyRequest(BaseModel):
    api_key: str

class SessionResponse(BaseModel):
    session_id: str

class ChatRequest(BaseModel):
    messages: List[Message]
    session_id: str

class ChatResponse(BaseModel):
    response: str
    
class FileUploadResponse(BaseModel):
    message: str
