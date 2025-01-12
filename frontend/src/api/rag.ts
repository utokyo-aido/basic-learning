interface ChatResponse {
  response: string;
}

export const clearRagData = async (): Promise<void> => {
  const response = await fetch('http://localhost:8000/rag/clear', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('RAGデータのクリアに失敗しました');
  }

  return response.json();
};

export const uploadPdf = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:8000/rag/upload-pdf', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('PDFのアップロードに失敗しました');
  }

  return response.json();
};

export const sendRagMessage = async (messages: { role: string; content: string }[]): Promise<ChatResponse> => {
  const response = await fetch('http://localhost:8000/rag/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error('メッセージの送信に失敗しました');
  }

  return response.json();
};