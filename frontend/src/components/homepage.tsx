import { Link } from "react-router-dom"
import { buttonVariants } from "../components/ui/button"

export default function HomePage() {
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
        <div className="p-8">
          <div>
            <Link
              to="/chat"
              className={buttonVariants({
                variant: "monochrome",
                size: "lg",
                className: "text-3xl font-semibold px-48 py-6 w-full"
              })}
            >
              Start Chat
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
