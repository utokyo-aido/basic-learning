import { useState, useEffect, useRef } from 'react'
import { Message } from '../types/chat'
import { Link, Navigate, useNavigate } from "react-router-dom"
import { buttonVariants } from "../components/ui/button"
import { uploadPdf, sendRagMessage } from '../api/rag'
import { useSession } from '../contexts/session'

function RagChatUI() {
  const navigate = useNavigate()
  const { sessionId } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // セッションがない場合はホームページにリダイレクト
  if (!sessionId) {
    return <Navigate to="/" replace />
  }

  useEffect(() => {
    // 初期メッセージを設定
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: 'こんにちは！通常の会話もできますし、PDFをアップロードしていただければその内容について詳しくお答えできます。'
        }
      ])
    }
  }, [])

  // ページを離れるときにRAGデータをクリア
  useEffect(() => {
    return () => {
      if (sessionId) {
        fetch(`http://localhost:8000/rag/clear/${sessionId}`, {
          method: 'POST'
        }).catch(error => {
          console.error('RAGデータのクリアに失敗:', error)
        })
      }
    }
  }, [sessionId])

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    try {
      await uploadPdf(file, sessionId)
      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          content: `📄 ${file.name} をアップロードしました`
        },
        {
          role: 'assistant',
          content: 'PDFを読み込みました。内容について質問してください。通常の会話も引き続き可能です。'
        }
      ])
    } catch (error) {
      console.error('Error uploading PDF:', error)
      if (error instanceof Error) {
        if (error.message.includes('Invalid or expired session')) {
          alert('セッションが無効または期限切れです。APIキーを再登録してください。')
          navigate('/')
        } else {
          alert(`エラーが発生しました: ${error.message}`)
        }
      } else {
        alert('予期せぬエラーが発生しました')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const newMessage: Message = {
      role: 'user',
      content: inputMessage
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await sendRagMessage({
        messages: [...messages, newMessage],
        session_id: sessionId
      })
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      if (error instanceof Error) {
        if (error.message.includes('Invalid or expired session')) {
          alert('セッションが無効または期限切れです。APIキーを再登録してください。')
          navigate('/')
        } else {
          alert(`エラーが発生しました: ${error.message}`)
        }
      } else {
        alert('予期せぬエラーが発生しました')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grep">
      <div className="p-5 flex justify-center">
        <Link
          to="/"
          className={buttonVariants({
            variant: "monochrome",
            size: "lg",
            className: "text-xl font-semibold px-12 py-6"
          })}
        >
          Home Page
        </Link>
      </div>
      <div className="chat-container">
        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}
            >
              {message.content}
            </div>
          ))}
          {isLoading && <div className="loading">Loading...</div>}
        </div>
        <div className="input-container">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFileUpload(file)
              }
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`chat-button mr-2 ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isUploading ? "アップロード中..." : "PDF"}
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="メッセージを入力..."
            disabled={isLoading}
            className="flex-1 p-2 border rounded-md mr-2"
          />
          <div
            onClick={!isLoading ? handleSendMessage : undefined}
            className={`chat-button ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            送信
          </div>
        </div>
      </div>
    </div>
  )
}

export default RagChatUI