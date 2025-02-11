from typing import Dict, Optional
import secrets
from cryptography.fernet import Fernet
import os
from datetime import datetime, timedelta

class SessionStore:
    def __init__(self):
        # 暗号化キーの生成または読み込み
        self.encryption_key = os.getenv("ENCRYPTION_KEY")
        if not self.encryption_key:
            self.encryption_key = Fernet.generate_key()
            print("Warning: ENCRYPTION_KEY not found in environment. Generated new key.")
        self.fernet = Fernet(self.encryption_key)
        
        # セッションストア
        self.sessions: Dict[str, dict] = {}

    def create_session(self, api_key: str) -> str:
        # セッションIDの生成
        session_id = secrets.token_urlsafe(32)
        
        # APIキーの暗号化
        encrypted_api_key = self.fernet.encrypt(api_key.encode())
        
        # セッション情報の保存
        self.sessions[session_id] = {
            'api_key': encrypted_api_key,
            'created_at': datetime.now(),
            'last_used': datetime.now()
        }
        
        return session_id

    def get_api_key(self, session_id: str) -> Optional[str]:
        session = self.sessions.get(session_id)
        if not session:
            return None
            
        # セッションの有効期限チェック（24時間）
        if datetime.now() - session['created_at'] > timedelta(hours=24):
            self.delete_session(session_id)
            return None
            
        # 最終使用時刻の更新
        session['last_used'] = datetime.now()
        
        # APIキーの復号化
        try:
            decrypted_api_key = self.fernet.decrypt(session['api_key'])
            return decrypted_api_key.decode()
        except Exception:
            return None

    def delete_session(self, session_id: str) -> None:
        if session_id in self.sessions:
            del self.sessions[session_id]

    def cleanup_expired_sessions(self) -> None:
        current_time = datetime.now()
        expired_sessions = [
            session_id
            for session_id, session in self.sessions.items()
            if current_time - session['created_at'] > timedelta(hours=24)
        ]
        for session_id in expired_sessions:
            self.delete_session(session_id)

# グローバルなセッションストアのインスタンス
session_store = SessionStore()