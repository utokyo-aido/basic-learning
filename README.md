# AI Document Chat Application

このプロジェクトは、PDFドキュメントを使用したRAG（Retrieval-Augmented Generation）チャットアプリケーションです。

## 技術スタック

### バックエンド
- Python 3.9+
- FastAPI
- LangChain
- OpenAI

### フロントエンド
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

## セットアップ手順

### 1. リポジトリのクローン
```bash
git clone [repository-url]
cd [repository-name]
```

### 2. 環境変数の設定
1. `.env.example`ファイルを`.env`にコピー
```bash
cp .env.example .env
```
2. `.env`ファイルを編集し、必要な環境変数を設定
   - `OPENAI_API_KEY`: OpenAI APIキー
   - その他の環境変数も適切に設定

### 3. バックエンドのセットアップ
1. Python仮想環境の作成と有効化（推奨）
```bash
python -m venv venv
source venv/bin/activate  # Linuxの場合
# または
.\venv\Scripts\activate  # Windowsの場合
```

2. 依存パッケージのインストール
```bash
pip install -r requirements.txt
```

3. バックエンドサーバーの起動
```bash
cd backend
uvicorn app.main:app --reload
```

### 4. フロントエンドのセットアップ
1. 依存パッケージのインストール
```bash
cd frontend
npm install
```

2. 開発サーバーの起動
```bash
npm run dev
```

## プロジェクト構造
```
.
├── backend/
│   ├── app/
│   │   ├── endpoints/    # APIエンドポイント
│   │   ├── services/     # ビジネスロジック
│   │   ├── schema/       # データモデル
│   │   └── main.py      # アプリケーションのエントリーポイント
│   └── data/
│       ├── pdf/          # PDFファイル保存ディレクトリ
│       └── vector_store/ # ベクトルストアデータ
└── frontend/
    ├── src/
    │   ├── components/   # Reactコンポーネント
    │   ├── api/          # APIクライアント
    │   └── types/        # TypeScript型定義
    └── public/           # 静的ファイル
```

## 開発の始め方

1. バックエンドの開発
   - `backend/app/`ディレクトリ内のPythonファイルを編集
   - 新しいエンドポイントは`endpoints/`ディレクトリに追加
   - ビジネスロジックは`services/`ディレクトリに実装

2. フロントエンドの開発
   - `frontend/src/`ディレクトリ内のファイルを編集
   - コンポーネントは`components/`ディレクトリに追加
   - APIクライアントは`api/`ディレクトリに実装

## 注意事項
- PDFファイルは`backend/data/pdf/`ディレクトリに配置してください
- 環境変数は必ず`.env`ファイルで管理してください
- コミット前に`npm run lint`でコードの品質チェックを実行してください