from backend.app.schema.message import Message
from backend.app.schema.message import ChatRequest, ChatResponse
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from typing import List
from langsmith import traceable
from fastapi import HTTPException
from .session import session_store

@traceable
class ChatService:
    def __init__(self):
        pass

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
            # セッションからAPIキーを取得
            api_key = session_store.get_api_key(chat_request.session_id)
            if not api_key:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid or expired session"
                )

            print("Converting messages:", chat_request.messages)
            langchain_messages = self._convert_to_langchain_messages(chat_request.messages)

            chat_model = ChatOpenAI(
                model="gpt-4o-mini",
                temperature=0.1,
                api_key=api_key
            )

            print("Converted messages:", langchain_messages)
            response = chat_model.invoke(langchain_messages)

            print("LLM response:", response)
            return ChatResponse(response=response.content)
        except HTTPException:
            raise
        except Exception as e:
            print("Error in get_chat_response:", str(e))
            raise HTTPException(
                status_code=500,
                detail="An error occurred while processing your request"
            )