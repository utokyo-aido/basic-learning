from app.schema.message import Message
from app.schema.message import ChatRequest, ChatResponse
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from typing import List
import os
from dotenv import load_dotenv
from langsmith import traceable
import asyncio

load_dotenv()

@traceable
class ChatService:
    def __init__(self):
        self.chat_model = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.1,
            api_key=os.getenv("OPENAI_API_KEY")
        )

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

    async def get_chat_response(self, chat_request: ChatRequest) -> ChatResponse:
        try:
            print("Converting messages:", chat_request.messages)
            langchain_messages = self._convert_to_langchain_messages(chat_request.messages)

            print("Converted messages:", langchain_messages)
            response = self.chat_model.invoke(langchain_messages)

            print("LLM response:", response)
            return ChatResponse(response=response.content)
        except Exception as e:
            print("Error in get_chat_response:", str(e))
            raise

# # テスト用のメイン関数
# if __name__ == "__main__":
#     async def main():
#         # テスト用のメッセージを作成
#         messages = [
#             Message(role="system", content="あなたは親切なアシスタントです。")
#         ]
        
#         # ChatServiceのインスタンスを作成
#         chat_service = ChatService()
        
#         while True:
#             # チャットレスポンスを取得
#             user_message = input("ユーザー: ")
#             if user_message.lower() == "q":
#                 break
#             messages.append(Message(role="user", content=user_message))
#             chat_request = ChatRequest(messages=messages)
#             response = await chat_service.get_chat_response(chat_request)
#             print("AI:", response.response)
#             messages.append(Message(role="assistant", content=response.response))

#     # 非同期関数を実行
#     asyncio.run(main())