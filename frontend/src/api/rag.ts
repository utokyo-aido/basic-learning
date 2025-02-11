import { ChatRequest, ChatResponse } from '../types/chat';

export const uploadPdf = async (file: File, sessionId: string): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('session_id', sessionId);

  const response = await fetch('http://localhost:8000/rag/upload-pdf', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'PDFのアップロードに失敗しました');
  }

  return response.json();
};

export const sendRagMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  const response = await fetch('http://localhost:8000/rag/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'メッセージの送信に失敗しました');
  }

  return response.json();
};