from backend.app.schema.message import Message
from backend.app.schema.message import ChatRequest, ChatResponse, FileUploadResponse
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from typing import List
import os
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langsmith import traceable
import asyncio
from fastapi import HTTPException
from .session import session_store

load_dotenv()

@traceable
class RagService:
    def __init__(self):
        self.vector_stores = {}  # セッションIDごとのベクトルストアを管理
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        # 絶対パスを使用
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.pdf_dir = os.path.join(base_dir, "data", "pdf")
        
        # ディレクトリが存在しない場合は作成
        os.makedirs(self.pdf_dir, exist_ok=True)

    def _convert_to_langchain_messages(self, messages: List[Message]):
        message_map = {
            "user": HumanMessage,
            "assistant": AIMessage,
            "system": SystemMessage
        }
        
        return [
            message_map[msg.role](content=msg.content)
            for msg in messages
        ]

    async def process_pdf(self, content: bytes, filename: str, session_id: str) -> FileUploadResponse:
        try:
            # セッションからAPIキーを取得
            api_key = session_store.get_api_key(session_id)
            if not api_key:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid or expired session"
                )

            embeddings = OpenAIEmbeddings(api_key=api_key)

            # PDFファイルを一時保存
            pdf_path = os.path.join(self.pdf_dir, f"{session_id}_{filename}")
            with open(pdf_path, 'wb') as f:
                f.write(content)

            try:
                # PDFを読み込み
                loader = PyPDFLoader(pdf_path)
                documents = loader.load()
                
                # テキストを分割
                splits = self.text_splitter.split_documents(documents)
                
                # セッションごとのベクトルストアを作成または更新
                if session_id in self.vector_stores:
                    self.vector_stores[session_id].add_documents(splits)
                else:
                    self.vector_stores[session_id] = FAISS.from_documents(splits, embeddings)
                
                return FileUploadResponse(message="PDFが正常に処理されました")
            finally:
                # 処理完了後に一時ファイルを削除
                if os.path.exists(pdf_path):
                    os.remove(pdf_path)

        except HTTPException:
            raise
        except Exception as e:
            print("Error processing PDF:", str(e))
            raise

    async def get_chat_response(self, chat_request: ChatRequest) -> ChatResponse:
        try:
            # セッションからAPIキーを取得
            api_key = session_store.get_api_key(chat_request.session_id)
            if not api_key:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid or expired session"
                )

            chat_model = ChatOpenAI(
                model="gpt-4o-mini",
                temperature=0.1,
                api_key=api_key
            )

            langchain_messages = self._convert_to_langchain_messages(chat_request.messages)

            # ベクトルストアが存在する場合は関連文書を検索して追加
            if chat_request.session_id in self.vector_stores:
                last_message = chat_request.messages[-1].content
                vector_store = self.vector_stores[chat_request.session_id]
                relevant_docs = vector_store.similarity_search(last_message, k=3)
                
                if relevant_docs:
                    context = "\n\n関連情報:\n" + "\n".join(doc.page_content for doc in relevant_docs)
                    langchain_messages.insert(-1, SystemMessage(content=context))

            response = chat_model.invoke(langchain_messages)
            return ChatResponse(response=response.content)

        except HTTPException:
            raise
        except Exception as e:
            print("Error in get_chat_response:", str(e))
            raise

    def clear_session_data(self, session_id: str) -> None:
        """特定のセッションのRAGデータをクリアする"""
        if session_id in self.vector_stores:
            del self.vector_stores[session_id]