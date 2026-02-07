import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { useTheme } from '../store/ThemeContext';
import { formatTime } from '../utils/api';
import { 
  Send, ImagePlus, Moon, Sun, LogOut, Bot, User, 
  Menu, Trash2, MessageSquare, Plus 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatInterface = () => {
  const { 
    messages, sendMessage, isLoading, 
    chatHistoryList, fetchChatList, loadChat, clearChat, chatId 
  } = useChat();
  
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // 1. Load History on Mount
  useEffect(() => {
    fetchChatList();
  }, [fetchChatList]);

  // 2. Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;
    
    await sendMessage(input, selectedFile, selectedModel);
    setInput("");
    setSelectedFile(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      
      {/* --- SIDEBAR --- */}
      <div className={`${isSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden`}>
        <div className="p-4 flex items-center justify-between">
           <div className="font-bold text-xl text-blue-600 dark:text-blue-400 flex items-center gap-2">
             <Bot size={24} /> NeuralChat
           </div>
        </div>

        {/* New Chat Button */}
        <div className="px-4 pb-2">
          <button 
            onClick={clearChat} 
            className="w-full flex items-center gap-2 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition text-gray-700 dark:text-gray-200"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>

        {/* HISTORY LIST */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">History</div>
          
          {chatHistoryList.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-10">No history yet.</div>
          )}

          {chatHistoryList.map((chat) => (
            <button
              key={chat._id}
              onClick={() => loadChat(chat._id)}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors text-sm truncate
                ${chatId === chat._id 
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              <MessageSquare size={16} className="flex-shrink-0 opacity-70" />
              <span className="truncate">{chat.title || "New Chat"}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-700 w-full p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* HEADER */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">
              <Menu size={20} />
            </button>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
            >
              <option value="gemini">✨ Gemini 2.5 Flash</option>
              <option value="groq">⚡ Groq (llama-3.2-90b-vision-preview)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
              VR
            </div>
          </div>
        </header>

        {/* MESSAGES FEED */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white dark:bg-gray-900 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <Bot size={64} className="mb-4" />
                <p>Start a new conversation with Gemini or Groq</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'ai' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
                </div>

                <div className={`max-w-[80%] space-y-1`}>
                  
                  {/* --- LABEL UPDATE HERE --- */}
                  <div className="text-xs text-gray-400 dark:text-gray-500 px-1 font-semibold flex items-center gap-1">
                    {msg.sender === 'ai' 
                      ? (msg.model ? msg.model.toUpperCase() : 'AI ASSISTANT') 
                      : 'YOU'
                    }
                    <span className="font-normal opacity-75">• {msg.timestamp ? formatTime(msg.timestamp) : 'Just now'}</span>
                  </div>

                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700'
                  }`}>
                    {msg.file && (
                      <div className="mb-2 p-2 bg-black/10 rounded text-xs flex items-center gap-2">
                        <ImagePlus size={14} /> {msg.file}
                      </div>
                    )}
                    {msg.text}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600">
                <Bot size={18} />
              </div>
              <div className="flex items-center gap-1 h-10 px-4">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto relative flex flex-col gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl border border-transparent focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            
            {/* Image Preview */}
            {selectedFile && (
              <div className="relative p-2 w-fit group">
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="Preview" 
                  className="h-16 w-16 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <button 
                onClick={() => document.getElementById('file-upload').click()}
                className={`p-2 rounded-lg transition-colors ${selectedFile ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                title="Upload Image"
              >
                <ImagePlus size={24} />
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Ask anything..."
                className="w-full bg-transparent border-none text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:ring-0 resize-none max-h-32 py-3"
                rows="1"
              />

              <button 
                onClick={handleSend}
                disabled={isLoading || (!input.trim() && !selectedFile)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          <div className="text-center text-xs text-gray-400 mt-2">
            AI can make mistakes. Check important info.
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatInterface;