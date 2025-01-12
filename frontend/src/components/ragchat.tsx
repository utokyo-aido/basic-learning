import { useState, useEffect, useRef } from 'react'
import { Message } from '../types/chat'
import { Link } from "react-router-dom"
import { buttonVariants } from "../components/ui/button"
import { uploadPdf, sendRagMessage, clearRagData } from '../api/rag'

function RagChatUI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    console.log('Current messages:', messages)
  }, [messages])

  // コンポーネントのアンマウント時にRAGデータをクリア
  useEffect(() => {
    return () => {
      console.log('RAGチャットコンポーネントのクリーンアップを実行')
      clearRagData().catch(error => {
        console.error('RAGデータのクリアに失敗:', error)
      })
    }
  }, [])

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    try {
      await uploadPdf(file)
      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          content: `📄 ${file.name} をアップロードしました`
        },
        {
          role: 'assistant',
          content: 'アップロードされたPDFについて、何か聞きたいことはありますか？'
        }
      ])
    } catch (error) {
      console.error('Error uploading PDF:', error)
      if (error instanceof Error) {
        alert(`エラーが発生しました: ${error.message}`)
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
      const response = await sendRagMessage([...messages, newMessage])
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      if (error instanceof Error) {
        alert(`エラーが発生しました: ${error.message}`)
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
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 p-2 border rounded-md mr-2"
          />
          <div
            onClick={!isLoading ? handleSendMessage : undefined}
            className={`chat-button ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Send
          </div>
        </div>
      </div>
    </div>
  )
}

export default RagChatUI