import { useState, useCallback, useRef } from 'react';
import API from '../utils/api';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [chatHistoryList, setChatHistoryList] = useState([]);
  
  
  const abortControllerRef = useRef(null);


  const fetchChatList = useCallback(async () => {
    try {
      const response = await API.get('/chats');
      setChatHistoryList(response.data);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  }, []);

  const loadChat = async (id) => {
    
    if (isLoading && abortControllerRef.current) {
        abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setChatId(id);
    setError(null);

    try {
      const response = await API.get(`/chats/${id}`);
      
      const formattedMessages = response.data.messages.map(msg => ({
        id: msg._id,
        text: msg.content,
        sender: msg.role === 'user' ? 'user' : 'ai',
        timestamp: msg.timestamp,
        file: msg.image === "Image uploaded" ? "Attached Image" : null,
        model: msg.model || null 
      }));
      
      setMessages(formattedMessages);
    } catch (err) {
      console.error("Load Chat Error:", err);
      setError("Failed to load conversation.");
    } finally {
      setIsLoading(false);
    }
  };

 
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      console.log("Generation stopped by user.");
    }
  }, []);

  const deleteChat = useCallback(async (idToDelete) => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    try {
      await API.delete(`/chats/${idToDelete}`);

      setChatHistoryList(prev => prev.filter(chat => chat._id !== idToDelete));

  
      if (chatId === idToDelete) {
        setMessages([]);
        setChatId(null);
      }
    } catch (err) {
      console.error("Delete Chat Error:", err);
      alert("Failed to delete chat. Please try again.");
    }
  }, [chatId]);

  const sendMessage = async (text, file, model) => {
    setIsLoading(true);
    setError(null);

    
    abortControllerRef.current = new AbortController();

    const userMsg = {
      id: Date.now(),
      text: text,
      sender: "user",
      file: file ? file.name : null,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const formData = new FormData();
      formData.append('message', text);
      formData.append('model', model);
      if (chatId) formData.append('chatId', chatId);
      if (file) formData.append('image', file);

      const response = await API.post('/chats/completion', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: abortControllerRef.current.signal, 
      });

      if (response.data.chatId) {
        setChatId(response.data.chatId);

        if (!chatId) fetchChatList(); 
      }

      const aiText = response.data.result || response.data.content || "No response";
      const actualModel = response.data.modelUsed;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: aiText,
          sender: "ai",
          timestamp: new Date(),
          model: actualModel
        },
      ]);

    } catch (err) {
      if (err.name === 'CanceledError' || err.code === "ERR_CANCELED") {
        console.log('Request canceled by user');
      } else {
        console.error("Send Message Error:", err);
        setError(err.response?.data?.error || "Failed to send message");
        
        setMessages(prev => [...prev, {
            id: Date.now(),
            text: "⚠️ Error: Failed to get response. Please try again.",
            sender: 'ai',
            isError: true
        }]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const clearChat = () => {
      setMessages([]);
      setChatId(null);
  };

  return { 
    messages, 
    sendMessage, 
    stopGeneration,
    deleteChat,    
    isLoading, 
    error, 
    chatId, 
    clearChat, 
    chatHistoryList, 
    fetchChatList, 
    loadChat 
  };
};