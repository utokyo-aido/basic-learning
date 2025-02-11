import ChatUI from "./components/chat";
import HomePage from "./components/homepage";
import RagChatUI from "./components/ragchat";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FC } from 'react';
import { SessionProvider } from './contexts/session';

const App: FC = () => {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatUI />} />
          <Route path="/ragchat" element={<RagChatUI />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
};

export default App;
