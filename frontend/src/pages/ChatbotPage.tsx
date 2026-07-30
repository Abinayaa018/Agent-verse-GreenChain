import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Trash2, Sparkles, Languages, MessageSquare } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load language settings
  useEffect(() => {
    const savedLang = localStorage.getItem('greenchain_lang') || 'English';
    setCurrentLang(savedLang);
    
    // Initial welcome message translated if necessary
    const welcome = savedLang === 'Tamil' 
      ? 'வணக்கம்! நான் கிரீன்-செயின் AI. உங்களுக்கு இன்று எப்படி உதவ முடியும்?'
      : savedLang === 'Hindi'
      ? 'नमस्ते! मैं ग्रीन-चेन AI हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?'
      : 'Hello! I am Green-Chain AI. How can I assist you with your circular resource operations today?';
      
    setMessages([
      {
        sender: 'bot',
        text: welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [currentLang]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await axios.post(`${apiBase}/api/chat`, {
        message: textToSend,
        lang: currentLang
      });

      const botMsg: ChatMessage = {
        sender: 'bot',
        text: response.data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat failed:', error);
      const errorMsg: ChatMessage = {
        sender: 'bot',
        text: currentLang === 'Tamil' 
          ? 'மன்னிக்கவும், பிணைய பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
          : 'Failed to communicate with AI orchestrator. Falling back to structured ledger details...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const suggestedPrompts = [
    "I have 300kg plastic scrap in Coimbatore.",
    "Recommend price for battery waste.",
    "What will be my environmental impact?",
    "Generate ESG report."
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] w-full gap-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#3FE6A8]" />
            CONVERSATIONAL INTELLIGENCE AGENT
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Orchestrate waste analysis, pricing, matching, and compliance checks via natural language.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[12px] bg-[#09171C] border border-[#1B3A38]/30 text-xs font-bold text-[#B9C4CC]">
            <Languages className="w-4 h-4 text-[#30D5FF]" />
            <span>Active Language: {currentLang}</span>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] bg-red-950/20 border border-red-900/40 hover:bg-red-900/30 text-xs font-bold text-red-400 transition"
          >
            <Trash2 className="w-4 h-4" />
            Clear logs
          </button>
        </div>
      </div>

      {/* Chat Messages Panel */}
      <div className="flex-1 overflow-y-auto p-5 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 backdrop-blur-sm flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <Sparkles className="w-10 h-10 text-[#3FE6A8] animate-pulse" />
            <p className="text-sm font-bold text-[#6F8088]">
              No active conversations. Send a prompt to query the network.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col max-w-[80%] ${
                msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-[#6F8088]">{msg.timestamp}</span>
                <span className="text-[10px] font-black tracking-widest text-[#B9C4CC] uppercase font-mono">
                  {msg.sender === 'user' ? 'CLIENT_SESSION' : 'GEMINI_ORCHESTRATOR'}
                </span>
              </div>
              <div
                className={`p-4 rounded-[16px] text-sm leading-relaxed border ${
                  msg.sender === 'user'
                    ? 'bg-[#09171C]/90 text-[#F5F7FA] border-[#2DD4FF]/25 shadow-[0_0_15px_rgba(48,213,255,0.02)]'
                    : 'bg-[#061016]/90 text-[#B9C4CC] border-[#3FE6A8]/20 shadow-[0_0_15px_rgba(63,230,168,0.03)]'
                }`}
                style={{ whiteSpace: 'pre-line' }}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="self-start max-w-[80%] flex flex-col items-start">
            <div className="text-[10px] font-black text-[#6F8088] mb-1 font-mono uppercase">
              ORCHESTRATOR_RUNNING
            </div>
            <div className="p-4 rounded-[16px] bg-[#061016]/80 text-[#6F8088] border border-[#3FE6A8]/10 flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3FE6A8] animate-ping" />
              <span>Analyzing intent and generating evidence-backed explanation...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="p-3 text-left rounded-[14px] bg-[#09171C]/60 hover:bg-[#09171C] border border-[#1B3A38]/20 text-xs font-bold text-[#B9C4CC] transition cursor-pointer flex items-center justify-between"
          >
            <span>{p}</span>
            <Sparkles className="w-3.5 h-3.5 text-[#30D5FF] shrink-0" />
          </button>
        ))}
      </div>

      {/* Input panel */}
      <div className="flex gap-3 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Type natural language (e.g. I have 300kg plastic in Coimbatore)..."
          className="flex-1 bg-[#09171C] border border-[#1B3A38]/40 rounded-[16px] py-4 px-5 text-sm text-[#F5F7FA] placeholder-[#6F8088] focus:outline-none focus:border-[#3FE6A8] transition shadow-[inset_0_0_15px_rgba(0,0,0,0.4)]"
        />
        <button
          onClick={() => handleSend(input)}
          className="flex items-center justify-center w-12 h-12 rounded-[16px] bg-gradient-to-r from-[#3FE6A8] to-[#30D5FF] text-[#050B0F] hover:brightness-110 shadow-[0_0_15px_rgba(63,230,168,0.2)] transition cursor-pointer"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
export default ChatbotPage;
