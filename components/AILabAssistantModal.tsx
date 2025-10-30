import React, { useState, useRef, useEffect } from 'react';
import { Component } from '../types.ts';
import { askAILabAssistant } from '../services/geminiService.ts';
import { AIAssistantIcon, SendIcon } from './Icons.tsx';

interface AILabAssistantModalProps {
  onClose: () => void;
  components: Component[];
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const AILabAssistantModal: React.FC<AILabAssistantModalProps> = ({ onClose, components }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I'm your TinkerHub AI Assistant. I can help you with inventory reports and project ideas. What can I help you with today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'fast' | 'deep'>('fast');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Updated suggestion prompts for better user experience
  const reportPrompts = [
    "What is the most issued component?",
    "Give a monthly breakdown of issues.",
    "Which components are running low on stock?",
    "What's the total quantity of all items?"
  ];

  const creativePrompts = [
    "Suggest a project with available parts.",
    "What can I build with an Arduino?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (prompt: string) => {
    if (!prompt || isLoading) return;

    const userMessage: Message = { sender: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // The context now includes the full issue history for better analysis
      const inventoryContext = JSON.stringify(components.map(({ name, category, totalQuantity, issuedTo, lowStockThreshold }) => ({
        name,
        category,
        totalQuantity,
        availableQuantity: totalQuantity - issuedTo.length,
        issueHistory: issuedTo.map(i => ({ studentName: i.studentName, issuedDate: i.issuedDate })),
        lowStockThreshold: lowStockThreshold ?? null,
      })));
      
      const aiResponseText = await askAILabAssistant(prompt, inventoryContext, mode);
      
      const aiMessage: Message = { sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      const errorMessage: Message = { sender: 'ai', text: `Sorry, I ran into an error: ${error.message}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFromInput = () => {
    const trimmedInput = input.trim();
    if (trimmedInput) {
      sendMessage(trimmedInput);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendFromInput();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-4 p-4 border-b border-slate-700">
            <div className="p-2 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full text-white">
                <AIAssistantIcon />
            </div>
            <div>
                <h2 className="text-xl font-bold text-sky-400">AI Lab Assistant</h2>
                <p className="text-sm text-slate-400">Your smart inventory helper</p>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        </header>

        <main className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && <div className="w-8 h-8 bg-slate-700 rounded-full flex-shrink-0"></div>}
              <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex-shrink-0"></div>
              <div className="max-w-md p-3 rounded-lg bg-slate-700 text-slate-200">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="p-4 border-t border-slate-700">
            <div className="mb-4">
              <p className="text-xs text-slate-400 mb-2 font-semibold">📈 Get Advanced Reports</p>
              <div className="flex flex-wrap gap-2">
                {reportPrompts.map((prompt, index) => (
                  <button
                    key={`report-${index}`}
                    onClick={() => sendMessage(prompt)}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-slate-700/70 text-slate-300 text-xs font-medium rounded-full hover:bg-slate-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-slate-400 mb-2 font-semibold">💡 Get Creative Ideas</p>
              <div className="flex flex-wrap gap-2">
                {creativePrompts.map((prompt, index) => (
                  <button
                    key={`creative-${index}`}
                    onClick={() => sendMessage(prompt)}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-slate-700/70 text-slate-300 text-xs font-medium rounded-full hover:bg-slate-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-slate-400">Assistant Mode:</span>
                <button
                    onClick={() => setMode('fast')}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${mode === 'fast' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'}`}
                >
                    ⚡ Fast
                </button>
                <button
                    onClick={() => setMode('deep')}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${mode === 'deep' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'}`}
                >
                    🧠 Deep Think
                </button>
            </div>
            <div className="flex items-center gap-2 bg-slate-700 rounded-lg p-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask 'How many Arduinos are available?'"
                    className="flex-grow bg-transparent text-white placeholder-slate-500 focus:outline-none px-2"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSendFromInput}
                    disabled={isLoading || !input.trim()}
                    className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                >
                    <SendIcon />
                </button>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default AILabAssistantModal;
