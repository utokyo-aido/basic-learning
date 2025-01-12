import { useState, useEffect} from 'react'
import { Message } from '../types/chat'
import { sendMessage} from '../api/chat'
import { Link } from "react-router-dom"
import { buttonVariants } from "../components/ui/button"

function ChatUI() {
  console.log('App component initialized')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log('Current messages:', messages)
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const newMessage: Message = {
      role: 'user',
      content: inputMessage
    }

    setMessages(prev => {
      const updatedMessages = [...prev, newMessage]
      console.log('Updated messages:', updatedMessages)
      return updatedMessages
    })
    setInputMessage('')
    setIsLoading(true)

    console.log('Sending API request with message:', newMessage)
    try {
      const response = await sendMessage({
        messages: [...messages, newMessage]
      })
      console.log('Received response:', response)

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

export default ChatUI
