import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { useTheme } from '../store/ThemeContext';
import { formatTime } from '../utils/api';
import { 
  Send, ImagePlus, Moon, Sun, LogOut, Bot, User, 
  Menu, Trash2, MessageSquare, Plus, Square, ArrowDown, Copy, Check, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
};

const ChatInterface = () => {
  const { 
    messages, sendMessage, stopGeneration, deleteChat, isLoading, 
    chatHistoryList, fetchChatList, loadChat, clearChat, chatId 
  } = useChat();
  
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [selectedFile, setSelectedFile] = useState(null);
  
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const textareaRef = useRef(null);

 
  useEffect(() => {
    fetchChatList();
  }, [fetchChatList]);


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

 
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

 const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;
    
    const textToSend = input;
    const fileToSend = selectedFile;
    const modelToUse = selectedModel;

    setInput("");
    setSelectedFile(null);
    if(textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage(textToSend, fileToSend, modelToUse);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  const handleMobileChatSelect = (id) => {
    loadChat(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false); 
  };

  const starters = [
    "Explain Quantum Computing",
    "Debug a React Hook",
    "Write a professional email",
    "Plan a 3-day trip"
  ];

  return (
    <div className={`flex h-[100dvh] overflow-hidden ${isDarkMode ? 'dark bg-[#0b0f19] text-gray-100' : 'bg-white text-gray-900'}`}>
      
      {/* --- SIDEBAR --- */}
      <aside 
        className={`
          fixed md:relative z-40 h-full flex flex-col
          bg-gray-50 dark:bg-[#111827] 
          border-r border-gray-200 dark:border-gray-700/50
          transition-all duration-300 ease-in-out
          
          /* RESPONSIVE LOGIC: 
             Mobile: Fixed width (w-72) always, just toggles translate.
             Desktop: Toggles width (w-72 to w-0) to push content. 
          */
          ${isSidebarOpen 
            ? 'translate-x-0 w-72' 
            : '-translate-x-full w-72 md:w-0 md:translate-x-0 md:overflow-hidden md:border-none'
          }
        `}
      >
        <div className="p-4 flex items-center justify-between shrink-0 min-w-[288px] md:min-w-0">
           <div className="font-bold text-xl text-blue-600 dark:text-blue-400 flex items-center gap-2">
             <img src="/logo.png" className="h-20" alt="" /> NeuralChat
           </div>
           {/* Mobile Close Button */}
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-gray-500 hover:text-gray-700">
             <X size={20} />
           </button>
        </div>

        <div className="px-4 pb-2 shrink-0 min-w-[288px] md:min-w-0">
          <button 
            onClick={() => { clearChat(); if(window.innerWidth < 768) setIsSidebarOpen(false); }} 
            className="w-full flex items-center gap-2 p-3 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-[#374151] transition text-sm font-medium"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 custom-scrollbar min-w-[288px] md:min-w-0">
          <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">History</div>
          
          {chatHistoryList.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-10">No history yet.</div>
          )}

          {chatHistoryList.map((chat) => (
            <div key={chat._id} className="group relative">
                <button
                  onClick={() => handleMobileChatSelect(chat._id)}
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors text-sm truncate pr-10
                      ${chatId === chat._id 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1f2937]'
                      }`}
                >
                  <MessageSquare size={16} className="flex-shrink-0 opacity-70" />
                  <span className="truncate">{chat.title || "New Chat"}</span>
                </button>
                
                <button
                    onClick={(e) => { e.stopPropagation(); deleteChat(chat._id); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Chat"
                >
                    <Trash2 size={14} />
                </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700/50 shrink-0 min-w-[288px] md:min-w-0">
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 w-full p-2 rounded transition text-sm font-medium">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- MAIN CHAT AREA --- */}
      <main className="flex-1 flex flex-col h-full relative w-full min-w-0 bg-white dark:bg-[#0b0f19]">
        
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-gray-200 dark:border-gray-700/50 flex items-center justify-between px-4 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#1f2937] rounded-full text-gray-600 dark:text-gray-300 shrink-0">
              <Menu size={20} />
            </button>
            
            {/* Model Selector - Truncated for small screens */}
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-gray-100 dark:bg-[#1f2937] border border-transparent dark:border-gray-700 text-sm rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none 
                         truncate max-w-[140px] md:max-w-xs cursor-pointer"
            >
              <option value="gemini">✨ Gemini 2.5</option>
              <option value="groq">⚡ Groq (Llama 3)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1f2937] text-gray-600 dark:text-gray-300 transition">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-lg">
              VR
            </div>
          </div>
        </header>

        {/* Messages Feed */}
        <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-3 md:p-4 space-y-6 scroll-smooth custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-80 px-4">
                 <img src="/logo.png" className="h-25" alt="" /> NeuralChat
                <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200 text-center">How can I help you?</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full max-w-2xl">
                    {starters.map((text) => (
                        <button
                            key={text}
                            onClick={() => setInput(text)}
                            className="p-3 text-sm text-left border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1f2937] transition text-gray-600 dark:text-gray-300 hover:shadow-sm"
                        >
                            {text}
                        </button>
                    ))}
                </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 md:gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''} group`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'ai' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
                </div>

                <div className={`max-w-[85%] md:max-w-[80%] space-y-1`}>
                  <div className={`text-xs text-gray-400 dark:text-gray-500 px-1 font-semibold flex items-center gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-between'}`}>
                    <span className="flex items-center gap-1">
                        {msg.sender === 'ai' ? (msg.model ? msg.model.toUpperCase() : 'AI') : 'YOU'}
                        <span className="font-normal opacity-50 hidden sm:inline">• {msg.timestamp ? formatTime(msg.timestamp) : 'Just now'}</span>
                    </span>
                    {msg.sender === 'ai' && <CopyButton text={msg.text} />}
                  </div>

                  <div className={`p-3 md:p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-gray-100 dark:bg-[#1f2937] text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700'
                  }`}>
                    {msg.file && (
                      <div className="mb-3 p-2 bg-black/5 dark:bg-black/20 rounded-lg text-xs flex items-center gap-2 border border-black/5 dark:border-white/5">
                        <ImagePlus size={14} className="shrink-0" /> 
                        <span className="truncate max-w-[150px]">{msg.file}</span>
                      </div>
                    )}
                    
                    <div className="prose dark:prose-invert max-w-none break-words text-sm md:text-base">
                        <MarkdownRenderer content={msg.text} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600">
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

        {/* Scroll To Bottom Button */}
        {showScrollButton && (
            <button 
                onClick={scrollToBottom}
                className="absolute bottom-24 right-6 p-2 bg-gray-100 dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-full shadow-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#374151] transition z-20"
            >
                <ArrowDown size={20} />
            </button>
        )}

        {/* INPUT AREA */}
        <div className="p-3 md:p-4 bg-white dark:bg-[#0b0f19] border-t border-gray-200 dark:border-gray-700/50 shrink-0">
          <div className="max-w-4xl mx-auto relative flex flex-col bg-gray-100 dark:bg-[#1f2937] p-2 rounded-2xl border border-transparent focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            
            {/* File Preview */}
            {selectedFile && (
              <div className="p-2 mb-2 flex items-center gap-3 bg-white dark:bg-black/20 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
                    <ImagePlus size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate dark:text-gray-200">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 hover:text-red-500 transition"
                >
                  <X size={16} />
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
                className={`p-2 md:p-2.5 rounded-xl transition-colors ${selectedFile ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                title="Upload Image"
                disabled={isLoading}
              >
                <ImagePlus size={22} />
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if(!isLoading) handleSend(e);
                  }
                }}
                placeholder={isLoading ? "Generating..." : "Ask anything..."}
                disabled={isLoading}
                className="w-full bg-transparent border-none text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:ring-0 resize-none max-h-32 py-3 px-1 text-base"
                rows="1"
              />

              <button 
                onClick={isLoading ? (e) => { e.preventDefault(); stopGeneration(); } : handleSend}
                disabled={!isLoading && (!input.trim() && !selectedFile)}
                className={`p-2 md:p-2.5 rounded-xl transition-all shadow-sm flex-shrink-0 ${
                    isLoading 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isLoading ? <Square size={20} fill="currentColor" /> : <Send size={20} />}
              </button>
            </div>
          </div>
          <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2 hidden md:block">
            AI can make mistakes. Check important info.
          </div>
        </div>

      </main>
    </div>
  );
};

export default ChatInterface;