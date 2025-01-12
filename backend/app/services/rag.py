from app.schema.message import Message
from app.schema.message import ChatRequest, ChatResponse, FileUploadResponse
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

load_dotenv()

@traceable
class RagService:
    def __init__(self):
        self.chat_model = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.1,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.embeddings = OpenAIEmbeddings(api_key=os.getenv("OPENAI_API_KEY"))
        self.vector_store = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        # 絶対パスを使用
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.pdf_dir = os.path.join(base_dir, "data", "pdf")
        self.vector_store_dir = os.path.join(base_dir, "data", "vector_store")
        
        print(f"PDF保存ディレクトリ: {self.pdf_dir}")
        print(f"ベクトルストア保存ディレクトリ: {self.vector_store_dir}")
        
        # ディレクトリが存在しない場合は作成
        os.makedirs(self.pdf_dir, exist_ok=True)
        os.makedirs(self.vector_store_dir, exist_ok=True)

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

    async def process_pdf(self, content: bytes, filename: str) -> FileUploadResponse:
        try:
            # PDFファイルを保存
            pdf_path = os.path.join(self.pdf_dir, filename)
            with open(pdf_path, 'wb') as f:
                f.write(content)

            print(f"PDFを保存しました: {pdf_path}")

            # PDFを読み込み
            loader = PyPDFLoader(pdf_path)
            documents = loader.load()
            
            print(f"PDFを読み込みました: {len(documents)}ページ")

            # テキストを分割
            splits = self.text_splitter.split_documents(documents)
            print(f"テキストを{len(splits)}個のチャンクに分割しました")
            
            # ベクトルストアを作成または更新
            vector_store_path = os.path.join(self.vector_store_dir, "faiss_index")
            if self.vector_store is None:
                print("新しいベクトルストアを作成します")
                self.vector_store = FAISS.from_documents(splits, self.embeddings)
            else:
                print("既存のベクトルストアに追加します")
                self.vector_store.add_documents(splits)
            
            # ベクトルストアを保存
            if self.vector_store:
                print(f"ベクトルストアを保存します: {vector_store_path}")
                os.makedirs(vector_store_path, exist_ok=True)
                self.vector_store.save_local(vector_store_path)
                print("ベクトルストアの保存が完了しました")
            
            return FileUploadResponse(message="PDFが正常に処理されました")
        except Exception as e:
            print("Error processing PDF:", str(e))
            raise

    async def get_chat_response(self, chat_request: ChatRequest) -> ChatResponse:
        try:
            print("チャットリクエストを処理します")
            langchain_messages = self._convert_to_langchain_messages(chat_request.messages)
            
            # ベクトルストアの存在確認
            vector_store_path = os.path.join(self.vector_store_dir, "faiss_index")
            if os.path.exists(os.path.join(vector_store_path, "index.faiss")):
                print("ベクトルストアを読み込みます")
                try:
                    if self.vector_store is None:
                        self.vector_store = FAISS.load_local(
                            vector_store_path,
                            self.embeddings,
                            allow_dangerous_deserialization=True
                        )
                        print("ベクトルストアの読み込みが完了しました")
                except Exception as e:
                    print(f"ベクトルストアの読み込みに失敗しました: {e}")
                    return ChatResponse(response="申し訳ありません。PDFデータの読み込みに問題が発生しました。")
            else:
                print("ベクトルストアが見つかりません")
                return ChatResponse(response="申し訳ありません。まだPDFがアップロードされていないようです。")
            
            if self.vector_store:
                # 最後のメッセージに対して関連文書を検索
                last_message = chat_request.messages[-1].content
                print(f"メッセージ「{last_message}」に関連する文書を検索します")
                relevant_docs = self.vector_store.similarity_search(last_message, k=3)
                print(f"{len(relevant_docs)}件の関連文書が見つかりました")
                
                # コンテキストを追加
                context = "\n\n関連情報:\n" + "\n".join(doc.page_content for doc in relevant_docs)
                langchain_messages.insert(-1, SystemMessage(content=context))
                print("関連情報をコンテキストに追加しました")

            print("AIモデルに問い合わせを送信します")
            response = self.chat_model.invoke(langchain_messages)
            print("AIモデルから応答を受信しました")
            return ChatResponse(response=response.content)
        except Exception as e:
            print("Error in get_chat_response:", str(e))
            raise

    async def clear_all_data(self) -> None:
        """すべてのRAGデータ（PDFとベクトルストア）をクリアする"""
        try:
            print("RAGデータのクリアを開始します")
            
            # ベクトルストアをクリア
            self.vector_store = None
            
            # vector_storeディレクトリの中身を削除
            vector_store_path = os.path.join(self.vector_store_dir, "faiss_index")
            if os.path.exists(os.path.join(vector_store_path, "index.faiss")):
                os.remove(os.path.join(vector_store_path, "index.faiss"))
                print("index.faissを削除しました")
            if os.path.exists(os.path.join(vector_store_path, "index.pkl")):
                os.remove(os.path.join(vector_store_path, "index.pkl"))
                print("index.pklを削除しました")
            
            # PDFディレクトリの中身を削除
            for file in os.listdir(self.pdf_dir):
                if file.endswith('.pdf'):
                    file_path = os.path.join(self.pdf_dir, file)
                    os.remove(file_path)
                    print(f"PDFを削除しました: {file}")
            
            print("RAGデータのクリアが完了しました")
            return {"message": "すべてのRAGデータがクリアされました"}
        except Exception as e:
            print(f"Error clearing RAG data: {e}")
            raise

# テスト用のメイン関数
if __name__ == "__main__":
    async def main():
        rag_service = RagService()
        
        # PDFファイルの処理
        pdf_path = "backend/data/pdf/example.pdf"
        with open(pdf_path, 'rb') as f:
            content = f.read()
        await rag_service.process_pdf(content, "example.pdf")
        
        # チャットテスト
        messages = [
            Message(role="system", content="あなたは親切なアシスタントです。PDFの内容について質問に答えてください。")
        ]
        
        while True:
            user_input = input("あなた: ")
            if user_input.lower() == 'q':
                # セッション終了時にクリア
                await rag_service.clear_all_data()
                break
                
            messages.append(Message(role="user", content=user_input))
            chat_request = ChatRequest(messages=messages)
            
            response = await rag_service.get_chat_response(chat_request)
            print("\nAI:", response.response)
            messages.append(Message(role="assistant", content=response.response))

    asyncio.run(main())