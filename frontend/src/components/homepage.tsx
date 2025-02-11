import { useState } from "react"
import { Link } from "react-router-dom"
import { buttonVariants } from "../components/ui/button"
import { useSession } from "../contexts/session"

export default function HomePage() {
  const { sessionId, isRegistering, registerKey, clearSession } = useSession()
  const [apiKey, setApiKey] = useState('')

  const handleRegister = async () => {
    if (!apiKey.trim()) {
      alert('APIキーを入力してください')
      return
    }
    try {
      await registerKey(apiKey)
      setApiKey('') // 登録成功後、入力フィールドをクリア
    } catch (error) {
      if (error instanceof Error) {
        alert(`APIキーの登録に失敗しました: ${error.message}`)
      } else {
        alert('予期せぬエラーが発生しました')
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* 背景レイヤー */}
      <div className="fixed inset-0 grid-background" />
      <div className="fixed inset-0 gradient-background" />

      {/* ヘッダー */}
      <header className="relative py-8 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Base Learning App</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-grow flex items-center justify-center relative">
        <div className="p-8 space-y-10 w-full max-w-2xl">
          {/* APIキー登録セクション */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-lg">
            {!sessionId ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">APIキーの登録</h2>
                <div className="relative">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="OpenAI APIキーを入力"
                    className="w-full p-3 border rounded-md bg-white/50"
                    disabled={isRegistering}
                  />
                </div>
                <button
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {isRegistering ? '登録中...' : 'APIキーを登録'}
                </button>
                <p className="text-sm text-gray-600">
                  ※APIキーは暗号化されてサーバーに保存され、24時間後に自動的に削除されます
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-100 p-4 rounded-md">
                <span className="text-green-700 font-medium">APIキーが登録されています</span>
                <button
                  onClick={clearSession}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  登録解除
                </button>
              </div>
            )}
          </div>

          {/* チャットボタン */}
          <div className="space-y-4">
            <Link
              to="/chat"
              className={buttonVariants({
                variant: "monochrome",
                size: "lg",
                className: `text-xl font-semibold px-48 py-6 w-full ${!sessionId ? 'opacity-50 cursor-not-allowed' : ''}`
              })}
              onClick={e => !sessionId && e.preventDefault()}
            >
              Start Chat
            </Link>
            <Link
              to="/ragchat"
              className={buttonVariants({
                variant: "monochrome",
                size: "lg",
                className: `text-xl font-semibold px-12 py-6 w-full ${!sessionId ? 'opacity-50 cursor-not-allowed' : ''}`
              })}
              onClick={e => !sessionId && e.preventDefault()}
            >
              Start RAG Chat
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
