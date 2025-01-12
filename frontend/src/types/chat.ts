export interface Message {
    role: string;
    content: string;
}

export interface ChatRequest {
    messages: Message[];
}

export interface ChatResponse {
    response: string;
}

export interface FileUploadResponse {
    message: string;
    success: boolean;
}