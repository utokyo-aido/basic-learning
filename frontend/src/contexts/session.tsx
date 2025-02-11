import React, { createContext, useContext, useState, useEffect } from 'react';
import { registerApiKey, deleteSession } from '../api/chat';

interface SessionContextType {
  sessionId: string | null;
  isRegistering: boolean;
  registerKey: (apiKey: string) => Promise<void>;
  clearSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const registerKey = async (apiKey: string) => {
    setIsRegistering(true);
    try {
      const response = await registerApiKey(apiKey);
      setSessionId(response.session_id);
    } finally {
      setIsRegistering(false);
    }
  };

  const clearSession = async () => {
    if (sessionId) {
      try {
        await deleteSession(sessionId);
      } finally {
        setSessionId(null);
      }
    }
  };

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        isRegistering,
        registerKey,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}