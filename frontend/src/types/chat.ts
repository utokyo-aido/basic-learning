export interface Message {
    role: string;
    content: string;
}

export interface ChatRequest {
    messages: Message[];
    session_id: string;
}

export interface ChatResponse {
    response: string;
}

export interface ApiKeyRequest {
    api_key: string;
}

export interface SessionResponse {
    session_id: string;
}

export interface FileUploadResponse {
    message: string;
    success: boolean;
}