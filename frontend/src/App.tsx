import ChatUI from "./components/chat";
import HomePage from "./components/homepage";
import RagChatUI from "./components/ragchat";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FC } from 'react';

const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatUI />} />
        <Route path="/ragchat" element={<RagChatUI />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

